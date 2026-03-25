// Cloudflare Pages Function - API Routes for D1 Database
// Esta función maneja todas las rutas /api/*

export interface Env {
  DB: D1Database;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- RUTA: LOGIN ---
    if (url.pathname === "/api/check-user" && request.method === "GET") {
      const phone = url.searchParams.get("phone");
      if (!phone) {
        return new Response(JSON.stringify({ found: false }), { headers: corsHeaders });
      }
      const user = await env.DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();
      return new Response(JSON.stringify(user ? { found: true, user } : { found: false }), { headers: corsHeaders });
    }

    // --- RUTA: GUARDAR USUARIO / ACTUALIZAR ---
    if (url.pathname === "/api/user" && request.method === "POST") {
      const data = await request.json() as any;
      
      await env.DB.prepare(`
        INSERT INTO users (id, name, phone, role, lat, lng, details, bio, avatar_url, status, last_seen, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          lat = excluded.lat, 
          lng = excluded.lng, 
          details = excluded.details,
          bio = excluded.bio,
          avatar_url = excluded.avatar_url,
          status = excluded.status,
          last_seen = datetime('now')
      `).bind(
        data.id, 
        data.name, 
        data.phone, 
        data.role, 
        data.lat || 0, 
        data.lng || 0, 
        data.details || '',
        data.bio || 'Sin biografía',
        data.avatar_url || '',
        data.status || 'offline'
      ).run();
      
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- RUTA: LISTA USUARIOS (FILTRO INACTIVIDAD 1 MIN) ---
    if (url.pathname === "/api/users" && request.method === "GET") {
      const { results } = await env.DB.prepare(`
        SELECT * FROM users 
        WHERE last_seen > datetime('now', '-60 seconds') 
        ORDER BY last_seen DESC
      `).all();
      return new Response(JSON.stringify(results || []), { headers: corsHeaders });
    }

    // --- RUTA: ACTUALIZAR PERFIL ---
    if (url.pathname === "/api/update-profile" && request.method === "POST") {
      const data = await request.json() as any;
      await env.DB.prepare("UPDATE users SET bio = ?, avatar_url = ? WHERE id = ?")
        .bind(data.bio, data.avatar_url, data.id).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- RUTA: CHECK NOTIFICATIONS ---
    if (url.pathname === "/api/check-notifications" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      if (!userId) {
        return new Response(JSON.stringify([]), { headers: corsHeaders });
      }
      const { results } = await env.DB.prepare(`
        SELECT m.*, u.name as sender_name FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? AND m.sender_id != ? 
        ORDER BY m.created_at DESC LIMIT 1
      `).bind(userId, userId).all();
      
      return new Response(JSON.stringify(results || []), { headers: corsHeaders });
    }

    // --- CHAT: GET MESSAGES ---
    if (url.pathname.startsWith("/api/messages/") && request.method === "GET") {
      const parts = url.pathname.split("/");
      const otherUserId = parts[parts.length - 1];
      const myId = url.searchParams.get("me");
      
      if (!myId || !otherUserId) {
        return new Response(JSON.stringify([]), { headers: corsHeaders });
      }
      
      const { results } = await env.DB.prepare(`
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
        ORDER BY created_at ASC
      `).bind(myId, otherUserId, otherUserId, myId).all();
      
      return new Response(JSON.stringify(results || []), { headers: corsHeaders });
    }

    // --- CHAT: SEND MESSAGE ---
    if (url.pathname === "/api/messages" && request.method === "POST") {
      const data = await request.json() as any;
      await env.DB.prepare("INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at) VALUES (?, ?, ?, 0, datetime('now'))")
        .bind(data.sender_id, data.receiver_id, data.message).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- RUTA: CHECK UNREAD MESSAGES ---
    if (url.pathname === "/api/unread-count" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      if (!userId) {
        return new Response(JSON.stringify({ count: 0 }), { headers: corsHeaders });
      }
      
      const result = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0
      `).bind(userId).first();
      
      return new Response(JSON.stringify({ count: result?.count || 0 }), { headers: corsHeaders });
    }

    // --- RUTA: MARCAR COMO LEIDO ---
    if (url.pathname === "/api/mark-read" && request.method === "POST") {
      const data = await request.json() as any;
      await env.DB.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?")
        .bind(data.myId, data.otherId).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- RESEÑAS: CREATE ---
    if (url.pathname === "/api/review" && request.method === "POST") {
      const data = await request.json() as any;
      await env.DB.prepare("INSERT INTO reviews (target_id, author_name, stars, comment, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
        .bind(data.targetId, data.author, data.stars, data.comment).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- RESEÑAS: GET ---
    if (url.pathname.startsWith("/api/reviews/") && request.method === "GET") {
      const parts = url.pathname.split("/");
      const targetId = parts[parts.length - 1];
      
      const { results } = await env.DB.prepare("SELECT * FROM reviews WHERE target_id = ? ORDER BY created_at DESC")
        .bind(targetId).all();
      
      return new Response(JSON.stringify(results || []), { headers: corsHeaders });
    }

    // Ruta no encontrada
    return new Response(JSON.stringify({ error: "Not Found" }), { 
      status: 404, 
      headers: corsHeaders 
    });

  } catch (err: any) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
};
