// functions/api/[[path]].js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const DB = env.DB; 

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- CHECK USER ---
    if (url.pathname === "/api/check-user" && request.method === "GET") {
      const phone = url.searchParams.get("phone");
      const user = await DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();
      return new Response(JSON.stringify(user ? { found: true, user } : { found: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- GET USER BY ID ---
    if (url.pathname === "/api/get-user-by-id" && request.method === "GET") {
      const userId = url.searchParams.get("id");
      const user = await DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      if (user) return new Response(JSON.stringify(user), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify(null), { status: 404, headers: corsHeaders });
    }

    // --- USER (UPSERT) ---
    if (url.pathname === "/api/user" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare(`
        INSERT INTO users (id, name, phone, role, lat, lng, details, bio, avatar_url, status, last_seen, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          name = excluded.name, phone = excluded.phone, role = excluded.role,
          lat = excluded.lat, lng = excluded.lng, details = excluded.details,
          bio = excluded.bio, avatar_url = excluded.avatar_url,
          status = excluded.status, last_seen = datetime('now')
      `).bind(data.id, data.name, data.phone, data.role, data.lat, data.lng, (data.details||''), (data.bio||''), (data.avatar_url||''), (data.status||'offline')).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- USERS LIST ---
    if (url.pathname === "/api/users" && request.method === "GET") {
      const { results } = await DB.prepare(`SELECT * FROM users WHERE last_seen > datetime('now', '-90 seconds') ORDER BY last_seen DESC`).all();
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- UPDATE PROFILE ---
    if (url.pathname === "/api/update-profile" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("UPDATE users SET bio = ?, avatar_url = ? WHERE id = ?").bind(data.bio, data.avatar_url, data.id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- MESSAGES (SEND & GET) ---
    if (url.pathname === "/api/messages" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, datetime('now'))").bind(data.sender_id, data.receiver_id, data.message).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (url.pathname.startsWith("/api/messages/") && request.method === "GET") {
      const otherUserId = url.pathname.split("/").pop();
      const myId = url.searchParams.get("me");
      const { results } = await DB.prepare(`SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`).bind(myId, otherUserId, otherUserId, myId).all();
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "ACCEPT-CONTENT-Type': "application/json" } });
    }
    
    // --- UNREAD COUNT ---
    if (url.pathname === "/api/unread-count" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      const result = await DB.prepare(`SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`).bind(userId).first();
      return new Response(JSON.stringify({ count: result ? result.count : 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- MARK READ ---
    if (url.pathname === "/api/mark-read" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?").bind(data.myId, data.otherId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- SERVICIOS (CREAR Y ACTUALIZAR ESTADO) ---
    if (url.pathname === "/api/request-service" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare(`INSERT INTO service_requests (client_id, driver_id, client_name, status, created_at) VALUES (?, ?, ?, 'pending', datetime('now'))`).bind(data.client_id, data.driver_id, data.client_name).run();
      // Mensaje automático
      await DB.prepare(`INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, '📢 SOLICITUD DE SERVICIO', datetime('now'))`).bind(data.client_id, data.driver_id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/get-ride-status" && request.method === "GET") {
      const myId = url.searchParams.get("my_id");
      const otherId = url.searchParams.get("other_id");
      const ride = await DB.prepare(`SELECT * FROM service_requests WHERE ((client_id = ? AND driver_id = ?) OR (client_id = ? AND driver_id = ?)) AND status IN ('pending', 'accepted', 'active') ORDER BY created_at DESC LIMIT 1`).bind(myId, otherId, otherId, myId).first();
      return new Response(JSON.stringify(ride || null), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- UPDATE RIDE (ACEPTAR / TERMINAR / CANCELAR / RECHAZAR) ---
    if (url.pathname === "/api/update-ride" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("UPDATE service_requests SET status = ? WHERE id = ?").bind(data.status, data.rideId).run();
      // Si hay calificación, se guarda también
      if (data.rating) {
        await DB.prepare("UPDATE service_requests SET rating = ?, review_comment = ? WHERE id = ?").bind(data.rating, data.comment, data.rideId).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/save-history" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare(`INSERT INTO ride_history (user_id, driver_name, status, rating, created_at) VALUES (?, ?, ?, ?, datetime('now'))`).bind(data.user_id, data.driver_name, data.status, data.rating || 0).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/history" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      const { results } = await DB.prepare("SELECT * FROM ride_history WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- REVIEWS (REVIEWS & ESTADÍSTICAS DEL CONDUCTOR) ---
    if (url.pathname === "/api/review" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("INSERT INTO reviews (target_id, author_name, stars, comment, created_at) VALUES (?, ?, ?, ?, datetime('now'))").bind(data.targetId, data.author, data.stars, data.comment).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    if (url.pathname.startsWith("/api/reviews/") && request.method === "GET") {
      const targetId = url.pathname.split("/").pop();
      // 1. Obtener reseñas
      const { results } = await DB.prepare("SELECT * FROM reviews WHERE target_id = ? ORDER BY created_at DESC").bind(targetId).all();
      
      // 2. Obtener promedio
      let avgRating = 0;
      if(results.length > 0) {
        const sum = results.reduce((acc, r) => acc + r.stars, 0);
        avgRating = (sum / results.length).toFixed(1);
      }

      // 3. Devolvemos un objeto con ambas cosas
      return new Response(JSON.stringify({ list: results, average: avgRating }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- DRIVER STATS (DASHBOARD CONDUCTOR) ---
    if (url.pathname === "/api/driver-stats" && request.method === "GET") {
      const driverId = url.searchParams.get("user_id");
      
      // 1. Carreras Totales
      const totalRidesRes = await DB.prepare("SELECT COUNT(*) as count FROM ride_history WHERE driver_name = (SELECT name FROM users WHERE id = ?)").bind(driverId).first();
      const totalRides = totalRides ? totalRides.count : 0;

      // 2. Promedio de Calificación (Desde la tabla reviews)
      const ratingRes = await DB.prepare("SELECT AVG(stars) as avg FROM reviews WHERE target_id = ?").bind(driverId).first();
      const avgRating = ratingRes && ratingRes.avg ? parseFloat(ratingRes.avg).toFixed(1) : "5.0";

      // 3. Ingresos Estimados ($2.0 por viaje por defecto)
      const estimatedEarnings = totalRides * 2.0; 

      return new Response(JSON.stringify({ 
        totalRides, 
        averageRating: avgRating, 
        earnings: estimatedEarnings 
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- CHECK NOTIFICATIONS (CORREGIDO Y PROTEGIDO) ---
    if (url.pathname === "/api/check-notifications" && request.method === "get") {
      const userId = url.searchParams.get("user_id");
      let notifications = [];

      try {
        // 1. Intentar buscar mensajes (Protegido con try/catch)
        try {
          const msg = await DB.prepare(`
            SELECT id, message, sender_id, 'message' as type, created_at
            FROM messages 
            WHERE receiver_id = ? AND sender_id != ?
            ORDER BY created_at DESC LIMIT 1
          `).bind(userId, userId).first();
          
          if (msg) notifications.push(msg);
        } catch (e) { console.error("Error leyendo mensajes:", e); }

        // 2. Intentar buscar solicitudes de servicio (Protegido con try/catch)
        try {
          const req = await DB.prepare(`
            SELECT id, client_id as sender_id, 'service_request' as type, created_at
            FROM service_requests 
            WHERE driver_id = ? AND status = 'pending'
            ORDER BY created_at DESC LIMIT 1
          `).bind(userId).first();
          
          if (req) notifications.push(req);
        } catch (e) {
          console.error("Error leyendo service_requests:", e);
        }

      } catch (err) {
        console.error("Error general check-notifications:", err);
      }

      return new Response(JSON.stringify(notifications), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });

  } catch (err) {
    return new Response("Server Error: " + err.message, { status: 500, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
  }
}