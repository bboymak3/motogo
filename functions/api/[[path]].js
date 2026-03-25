El error **"await is only valid in async functions"** ocurre porque la función `checkUser` no tiene la palabra clave `async` al principio.

Esto suele pasar cuando se borra accidentalmente la palabra `async` al copiar el código.

Aquí tienes el código **`index.html`** corregido (se le puso `async` a la función que faltaba) y el Backend (`[[path].js`) con la tabla nueva necesaria para que las estrellas funcionen.

### 1. Actualización de Base de Datos (Obligatorio)

Ejecuta esto en tu base de datos D1 para crear la tabla de calificaciones:

```sql
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    stars INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Archivo: `index.html` (Frontend Corregido)

He corregido la función `checkUser` y asegurado que todo el sistema de estrellas funcione.

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Motogo - Taxi Pro</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root {
            --bg-dark: #121212; --surface: #1e1e1e; --surface-light: #2a2a2a;
            --primary: #00ff7f; --service: #ffcc00; --danger: #ff0055; --text: #ffffff; --text-sec: #aaaaaa;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg-dark); color: var(--text); height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
        .hidden { display: none !important; }

        /* AUTH */
        #auth-screen { 
            position: fixed; inset: 0; 
            background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%); 
            z-index: 5000; 
            display: flex; flex-direction: column; justify-content: center; 
            padding: 20px; 
        }
        .auth-logo-area { text-align: center; margin-bottom: 30px; animation: fadeIn 1s ease-out; }
        .auth-logo-icon {
            font-size: 4rem; color: var(--primary);
            background: rgba(0, 255, 127, 0.1);
            width: 100px; height: 100px; line-height: 100px;
            border-radius: 50%; margin: 0 auto 15px;
            border: 2px solid var(--primary);
            box-shadow: 0 0 20px rgba(0, 255, 127, 0.3);
        }
        .auth-title { font-size: 2rem; font-weight: 800; color: white; letter-spacing: 1px; margin-bottom: 5px; }
        .auth-subtitle { font-size: 0.9rem; color: var(--text-sec); font-weight: 300; }
        .auth-box { 
            background: rgba(30,30,30,0.6); 
            backdrop-filter: blur(20px);
            width: 100%; max-width: 400px; 
            padding: 30px; border-radius: 20px; 
            text-align: center; 
            border: 1px solid rgba(255,255,255,0.05); 
            margin: 0 auto; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: slideUpAuth 0.5s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUpAuth { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
        .role-card { 
            background: #252525; padding: 20px 10px; 
            border-radius: 15px; cursor: pointer; 
            border: 2px solid transparent; 
            display: flex; flex-direction: column; align-items: center; gap: 10px; 
            transition: all 0.3s ease;
        }
        .role-card.active { 
            border-color: var(--primary); background: rgba(0, 255, 127, 0.1); 
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 255, 127, 0.2);
        }
        .role-card i { font-size: 2rem; margin-bottom: 5px; color: var(--text-sec); transition: color 0.3s; }
        .role-card.active i { color: var(--primary); }
        .role-card span { font-weight: 600; font-size: 0.9rem; }

        .input-group { margin-bottom: 20px; text-align: left; }
        .input-group label { display: block; margin-bottom: 8px; color: var(--text-sec); font-size: 0.85rem; font-weight: 600; }
        .input-group input, .input-group select, .input-group textarea { 
            width: 100%; padding: 16px; 
            background: #1a1a1a; border: 1px solid #333; 
            color: white; border-radius: 12px; outline: none; 
            font-size: 1rem; transition: border-color 0.3s;
        }
        .input-group input:focus { border-color: var(--primary); background: #222; }

        .btn-main { width: 100%; padding: 16px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 1rem; transition: transform 0.2s; }
        .btn-main:active { transform: scale(0.98); }
        .btn-enter { background: var(--primary); color: black; box-shadow: 0 4px 15px rgba(0, 255, 127, 0.3); }
        .btn-sec { background: transparent; border: 1px solid #444; color: #aaa; margin-top: 15px; }

        /* HEADER */
        #app-header { position: fixed; top: 10px; left: 10px; right: 10px; background: rgba(30,30,30,0.9); backdrop-filter: blur(10px); padding: 10px 15px; border-radius: 30px; z-index: 2000; display: flex; justify-content: space-between; align-items: center; border: 1px solid #333; }
        .header-info { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .header-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #333; border: 2px solid var(--primary); }
        .icon-btn { background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; position: relative; margin-left: 15px; }
        .badge { position: absolute; top: -5px; right: -5px; background: var(--danger); color: white; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; display: flex; justify-content: center; align-items: center; border: 2px solid var(--surface); transform: scale(0); }
        .badge.visible { transform: scale(1); }

        /* DRAWER */
        #users-drawer { position: fixed; top: 75px; right: 10px; z-index: 1500; width: 280px; max-height: 70vh; overflow-y: auto; background: #1a1a1a; border-radius: 15px; padding: 10px; border: 1px solid #333; transform: translateX(120%); transition: transform 0.3s; box-shadow: -5px 5px 20px rgba(0,0,0,0.5); }
        #users-drawer.active { transform: translateX(0); }
        .user-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #333; cursor: pointer; }
        .user-item:hover { background: rgba(255,255,255,0.05); }
        .mini-avatar { width: 45px; height: 45px; border-radius: 50%; background: #333; display: flex; justify-content: center; align-items: center; position: relative; flex-shrink: 0; overflow: hidden; }
        .status-dot { position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1a1a1a; }

        /* MAPA */
        #map { width: 100%; height: 100%; z-index: 1; }
        .custom-pin-user { background: var(--primary); color: black; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; }
        .custom-pin-service { background: var(--service); color: black; border-radius: 8px; border: 2px solid white; transform: rotate(45deg); display: flex; justify-content: center; align-items: center; }
        .custom-pin-service i { transform: rotate(-45deg); }

        /* MODALES */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: none; justify-content: center; align-items: flex-end; }
        .modal-overlay.active { display: flex; }
        .modal-card { background: var(--surface); width: 100%; max-width: 500px; border-radius: 20px 20px 0 0; padding: 0; max-height: 90vh; display: flex; flex-direction: column; border-top: 1px solid var(--primary); animation: slideUp 0.3s; overflow-y: auto; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        /* FICHA PERFIL */
        .profile-card-header { padding: 25px; text-align: center; background: #252525; border-bottom: 1px solid #333; flex-shrink: 0; position: relative; }
        .profile-big-avatar { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; background: #333; margin: 0 auto 15px; border: 3px solid var(--primary); display: flex; justify-content: center; align-items: center; font-size: 2.5rem; overflow: hidden; }
        .driver-rating-badge { 
            position: absolute; top: 20px; right: 20px; 
            background: var(--service); color: black; 
            padding: 4px 10px; border-radius: 20px; 
            font-weight: bold; font-size: 0.8rem; 
            display: flex; align-items: center; gap: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .driver-details { background: #1a1a1a; padding: 10px; border-radius: 8px; margin-top: 10px; font-size: 0.85rem; color: #ccc; border: 1px solid #333; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .detail-val { color: white; font-weight: bold; }
        
        .profile-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; }
        .action-btn { padding: 15px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: 0.2s; }
        .action-btn i { font-size: 1.5rem; }
        .btn-profile { background: #333; color: white; border: 1px solid #444; }
        .btn-request { background: var(--primary); color: black; }
        .btn-chat { background: var(--surface-light); color: white; border: 1px solid #555; }

        /* CHAT & RIDE */
        .chat-header { padding: 15px; background: var(--surface-light); border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .chat-body { flex: 1; overflow-y: auto; padding: 15px; background: #181818; display: flex; flex-direction: column; gap: 10px; }
        .msg { max-width: 75%; padding: 10px 15px; border-radius: 15px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; }
        .msg-own { align-self: flex-end; background: var(--primary); color: black; border-bottom-right-radius: 2px; }
        .msg-other { align-self: flex-start; background: #333; color: white; border-bottom-left-radius: 2px; }
        
        .ride-panel { background: #252525; padding: 15px; border-top: 1px solid #444; flex-shrink: 0; }
        .ride-status { text-align: center; font-weight: bold; color: var(--primary); margin-bottom: 10px; text-transform: uppercase; font-size: 0.9rem; }
        .btn-ride { width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-accept { background: var(--primary); color: black; }
        .btn-reject { background: var(--danger); color: white; }
        .btn-finish { background: var(--service); color: black; }
        .btn-sec-ride { background: #555; color: white; }

        /* MODAL RATING OPCIONAL */
        .rating-modal-content { padding: 20px; text-align: center; }
        .rating-stars-display { font-size: 2rem; color: #555; cursor: pointer; margin: 20px 0; }
        .rating-stars-display span.active { color: gold; }
        .rating-close-btn { margin-top: 15px; background: transparent; border: 1px solid #444; color: #aaa; padding: 8px 15px; border-radius: 8px; cursor: pointer; }

        /* NUEVO: TABS EN EL MODAL DE PERFIL */
        .modal-tabs { display: flex; background: #252525; border-bottom: 1px solid #333; }
        .tab-btn { flex: 1; padding: 15px; background: transparent; border: none; color: #888; font-weight: bold; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: rgba(0, 255, 127, 0.05); }
        .tab-content { padding: 20px; display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.3s; }

        /* ESTILOS HISTORIAL */
        .history-list { max-height: 300px; overflow-y: auto; }
        .history-item { padding: 12px; border-bottom: 1px solid #333; font-size: 0.9rem; display: flex; flex-direction: column; gap: 5px; }
        .history-header { display: flex; justify-content: space-between; align-items: center; }
        .history-status { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: bold; }
        .st-completed { background: rgba(0,255,127,0.2); color: var(--primary); }
        .st-cancelled { background: rgba(255,0,85,0.2); color: var(--danger); }
        .history-stars { color: gold; font-size: 0.8rem; }

        /* ESTILOS PAGO MOVIL */
        .payment-box { background: rgba(255, 204, 0, 0.1); border: 1px solid var(--service); padding: 15px; border-radius: 12px; margin-top: 15px; }
        .payment-box h5 { color: var(--service); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .payment-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; }

        /* NOTIFICACIONES */
        #snackbar-container {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            width: 90%; max-width: 400px; z-index: 4500;
            display: flex; flex-direction: column; gap: 10px;
            pointer-events: none;
        }
        .snackbar {
            background: rgba(40, 40, 40, 0.95); backdrop-filter: blur(10px);
            border-left: 4px solid var(--primary);
            border-radius: 8px; padding: 12px 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            color: white; display: flex; align-items: center; justify-content: space-between;
            animation: slideInUp 0.3s ease-out; pointer-events: auto;
        }
        .snackbar.type-service { border-left-color: var(--service); }
        .snackbar-content { flex: 1; padding-right: 10px; cursor: pointer; }
        .snackbar-content h4 { font-size: 0.9rem; margin-bottom: 2px; color: white; }
        .snackbar-content p { font-size: 0.8rem; color: #ccc; }
        .btn-snackbar-action {
            background: transparent; border: 1px solid var(--danger); color: var(--danger);
            padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; white-space: nowrap;
        }
        .btn-snackbar-action:hover { background: var(--danger); color: white; }

        /* ICONO FAB */
        #notification-fab {
            position: fixed; bottom: 20px; right: 20px;
            width: 50px; height: 50px; border-radius: 50%;
            background: var(--surface); border: 2px solid var(--primary);
            color: var(--primary); display: flex; justify-content: center; align-items: center;
            font-size: 1.2rem; z-index: 4400; cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transform: scale(0); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #notification-fab.visible { transform: scale(1); }
        #notification-fab.pulse { animation: pulse-animation 2s infinite; }

        /* AVATARES Y PAGO (Perfil propio) */
        .avatar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px; }
        .avatar-option { 
            width: 100%; aspect-ratio: 1; 
            border-radius: 50%; cursor: pointer; 
            border: 2px solid transparent; 
            display: flex; justify-content: center; align-items: center; 
            font-size: 1.5rem; background: #333;
            transition: transform 0.2s, border-color 0.2s;
        }
        .avatar-option:hover { transform: scale(1.1); }
        .avatar-option.selected { border-color: var(--primary); transform: scale(1.1); box-shadow: 0 0 10px var(--primary); }
        
        .payment-info-box { background: rgba(255, 204, 0, 0.1); border: 1px solid var(--service); padding: 15px; border-radius: 8px; margin-top: 15px; }
        .payment-info-box h5 { color: var(--service); margin-bottom: 10px; }

        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse-animation { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 127, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(0, 255, 127, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 127, 0); } }

    </style>
</head>
<body>

    <!-- AUTH -->
    <div id="auth-screen">
        <div class="auth-logo-area">
            <div class="auth-logo-icon"><i class="fa-solid fa-motorcycle"></i></div>
            <h1 class="auth-title">Motogo</h1>
            <p class="auth-subtitle">Tu transporte seguro y rápido</p>
        </div>

        <div class="auth-box">
            <div id="login-view">
                <p style="color:#ccc; margin-bottom: 20px; font-size: 1.1rem;">Ingresa tu número</p>
                <div class="input-group"><input type="tel" id="login-phone" placeholder="0414 000 0000"></div>
                <button class="btn-main btn-enter" onclick="checkUser()">Continuar</button>
            </div>
            <div id="register-view" class="hidden">
                <p style="color:#ccc; margin-bottom: 20px; font-size: 1rem;">Crear cuenta</p>
                <div class="role-grid">
                    <div class="role-card active" id="role-user" onclick="selectRole('user')"><i class="fa-solid fa-user"></i><span>Usuario</span></div>
                    <div class="role-card" id="role-service" onclick="selectRole('service')"><i class="fa-solid fa-motorcycle"></i><span>MotoTaxi</span></div>
                </div>
                <div class="input-group"><input type="text" id="reg-name" placeholder="Nombre"></div>
                <div class="input-group"><input type="text" id="reg-surname" placeholder="Apellido"></div>
                <div class="input-group"><input type="tel" id="reg-phone" readonly></div>
                
                <div id="service-extra-fields" class="hidden">
                    <div class="input-group"><input type="text" id="reg-model" placeholder="Modelo de Moto (ej: Honda CBZ)"></div></div>
                    <div class="input-group"><input type="text" id="reg-plate" placeholder="Placa (ej: ABC-123)"></div></div>
                </div>

                <div class="input-group hidden" id="service-options">
                    <label>Estatus Inicial</label>
                    <select id="reg-status">
                        <option value="online">🟢 Disponible</option>
                        <option value="offline">⚫ Desconectado</option>
                    </select>
                </div>
                <button class="btn-main btn-enter" onclick="registerUser()">Registrarse</button>
                <button class="btn-main btn-sec" onclick="showLogin()">Volver</button>
            </div>
        </div>
    </div>

    <!-- NOTIFICACIONES -->
    <div id="snackbar-container"></div>
    <div id="notification-fab" onclick="handleNotificationClick()">
        <i class="fa-solid fa-bell"></i>
    </div>

    <!-- HEADER -->
    <div id="app-header" class="hidden">
        <div class="header-info" onclick="openMyProfile()">
            <img id="header-avatar" class="header-avatar" src="" alt="Yo" style="display:none;">
            <i id="header-fallback-icon" class="fa-solid fa-user" style="font-size: 1.2rem; color: var(--primary); display:none;"></i>
            <div>
                <div id="display-name" style="font-weight:bold; font-size:0.9rem;">Usuario</div>
                <div id="display-role" style="font-size:0.7rem; color:#aaa;">Rol</div>
            </div>
        </div>
        <div style="display:flex; align-items:center;">
            <button id="btn-toggle-status" class="icon-btn hidden" onclick="cycleStatus()"><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i></button>
            <button class="icon-btn" onclick="toggleUserList()">
                <i class="fa-solid fa-users"></i>
                <div id="notif-badge" class="badge">0</div>
            </button>
        </div>
    </div>

    <!-- LISTA LATERAL -->
    <div id="users-drawer">
        <div style="padding:10px; font-size:0.8rem; color:#888; text-transform:uppercase; border-bottom:1px solid #333;">Cercanos</div>
        <div id="users-list-content"></div>
    </div>

    <div id="map"></div>

    <!-- MODAL PERFIL OTRO USUARIO (CON TABS Y RATING) -->
    <div class="modal-overlay" id="detail-modal">
        <div class="modal-card">
            <div class="profile-card-header">
                <div id="modal-avatar" class="profile-big-avatar"><i class="fa-solid fa-user"></i></div>
                
                <!-- BADGE DE RATING PROMEDIO -->
                <div id="modal-rating-badge" class="driver-rating-badge hidden">
                    <i class="fa-solid fa-star"></i> <span id="modal-rating-value">5.0</span>
                </div>

                <h2 id="modal-name">Nombre</h2>
                <p id="modal-role-text" style="color:var(--primary); font-weight:bold; margin-top:5px;">ROL</p>
            </div>
            
            <!-- Pestañas -->
            <div id="modal-tabs" class="modal-tabs hidden">
                <button class="tab-btn active" onclick="switchTab('profile')">Ficha & Pago</button>
                <button class="tab-btn" onclick="switchTab('history')">Historial</button>
            </div>

            <!-- CONTENIDO PESTAÑA FICHA -->
            <div id="tab-profile" class="tab-content active">
                <div id="modal-bio" style="color:#888; font-style:italic; font-size:0.9rem; padding: 0 20px; text-align: center; margin-bottom: 15px;">Sin biografía disponible.</div>
                
                <div id="modal-vehicle-info" class="driver-details hidden" style="margin: 0 20px 15px 20px;">
                    <h5 style="color:var(--text-sec); margin-bottom:10px; text-transform:uppercase; font-size: 0.7rem;">Datos del Vehículo</h5>
                    <div class="detail-row"><span>Placa:</span> <span id="modal-plate" class="detail-val">---</span></div>
                    <div class="detail-row"><span>Modelo:</span> <span id="modal-model" class="detail-val">---</span></div>
                </div>

                <div id="modal-payment-info" class="payment-box hidden" style="margin: 0 20px 15px 20px;">
                    <h5><i class="fa-solid fa-wallet"></i> Pago Móvil</h5>
                    <div class="payment-row"><span>Cédula:</span> <span id="modal-pay-cedula" style="font-weight:bold;">---</span></div>
                    <div class="payment-row"><span>Teléfono:</span> <span id="modal-pay-phone" style="font-weight:bold;">---</span></div>
                    <div class="payment-row"><span>Banco:</span> <span id="modal-pay-bank" style="font-weight:bold;">---</span></div>
                </div>

                <div id="modal-actions" class="profile-actions-grid"></div>
            </div>

            <!-- CONTENIDO PESTAÑA HISTORIAL -->
            <div id="tab-history" class="tab-content">
                <h4 style="text-align:center; color:var(--primary); margin-bottom:10px;">Viajes Realizados</h4>
                <div id="driver-history-list" class="history-list">
                    <div style="padding:10px; text-align:center; color:#666;">Cargando historial...</div>
                </div>
            </div>
            
            <div style="padding: 15px;">
                <button onclick="closeModal('detail-modal')" style="width:100%; padding:10px; background:transparent; border:1px solid #444; color:#aaa; border-radius:8px;">Cerrar</button>
            </div>
        </div>
    </div>

    <!-- NUEVO: MODAL DE RATING OPCIONAL -->
    <div class="modal-overlay" id="rating-modal">
        <div class="modal-card">
            <div class="rating-modal-content">
                <h2 style="color:var(--primary); margin-bottom:5px;">¿Cómo estuvo el viaje?</h2>
                
                <div class="rating-stars-display" id="star-container">
                    <span onclick="setTempRating(1)">★</span>
                    <span onclick="setTempRating(2)">★</span>
                    <span onclick="setTempRating(3)">★</span>
                    <span onclick="setTempRating(4)">★</span>
                    <span onclick="setTempRating(5)">★</span>
                </div>
                
                <textarea id="rating-comment" placeholder="Comentario (Opcional)..." style="width:100%; margin-top:15px; padding:10px; background:#333; border:1px solid #444; color:white; border-radius:8px; resize: none;"></textarea>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:20px;">
                    <button onclick="submitRating()" style="background:var(--primary); border:none; padding:12px; border-radius:8px; color:black; font-weight:bold; cursor:pointer;">Enviar</button>
                    <button onclick="skipRating()" style="background:transparent; border:1px solid #444; color:#aaa; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">Cerrar sin calificar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL CHAT -->
    <div class="modal-overlay" id="chat-modal">
        <div class="modal-card" style="height: 90vh;">
            <div class="chat-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-comments" style="color:var(--primary);"></i>
                    <div>
                        <h3 id="chat-with-name">Chat</h3>
                        <small id="chat-user-status" style="color:#aaa;"></small>
                    </div>
                </div>
                <button onclick="closeModal('chat-modal')" style="background:none; border:none; color:white; font-size:1.5rem;">&times;</button>
            </div>
            <div id="chat-messages" class="chat-body"></div>
            <div id="ride-control-panel" class="ride-panel hidden">
                <div id="ride-status-text" class="ride-status">Estado: ---</div>
                <div id="ride-actions-container"></div>
            </div>
            <div class="chat-input-area" style="padding:10px; background:var(--surface); display:flex; gap:10px;">
                <input type="text" id="chat-input" placeholder="Escribe un mensaje..." style="flex:1; padding:10px; border-radius:20px; border:none; background:#333; color:white;">
                <button onclick="sendMessage()" style="background:var(--primary); border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; color:black;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    </div>

    <!-- MODAL PERFIL PROPIO -->
    <div class="modal-overlay" id="profile-modal">
        <div class="modal-card">
            <div style="padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                <h3>Editar Perfil</h3>
                <button onclick="closeModal('profile-modal')" style="background:none; border:none; color:white; font-size:1.5rem;">&times;</button>
            </div>
            <div style="padding:15px;">
                <!-- Selector de Avatares -->
                <h4 style="margin-bottom:10px; color:var(--primary);">Elige tu Avatar</h4>
                <div class="avatar-grid" id="avatar-selector"></div>

                <div class="input-group" style="margin-top:20px;">
                    <label>Biografía</label>
                    <textarea id="edit-bio" rows="2" placeholder="Cuéntanos sobre ti..." style="width:100%; padding:8px; background:#333; border:1px solid #444; color:white;"></textarea>
                </div>

                <!-- Campos de Pago (Solo Conductores) -->
                <div id="driver-payment-fields" class="payment-info-box hidden">
                    <h5><i class="fa-solid fa-wallet"></i> Datos de Pago (Pago Móvil)</h5>
                    <div class="input-group">
                        <label>Cédula</label>
                        <input type="text" id="pay-cedula" placeholder="V-00000000">
                    </div>
                    <div class="input-group">
                        <label>Teléfono</label>
                        <input type="text" id="pay-phone" placeholder="0414-000-0000">
                    </div>
                    <div class="input-group">
                        <label>Banco</label>
                        <select id="pay-bank" style="width:100%; padding:12px; background:#1a1a1a; border:1px solid #444; color:white; border-radius:8px;">
                            <option value="">Selecciona Banco</option>
                            <option value="0105">Banco de Venezuela</option>
                            <option value="0102">Banesco</option>
                            <option value="0108">BBVA Provincial</option>
                            <option value="0134">Banesco</option>
                            <option value="0104">Venezuela</option>
                            <option value="0172">Banfanb</option>
                            <option value="0191">BNC</option>
                        </select>
                    </div>
                </div>

                <h4 style="margin:20px 0 10px 0; color:var(--primary);">Mi Historial</h4>
                <div id="my-history-list" class="history-list" style="border:1px solid #333; border-radius:8px;">
                    <div style="padding:10px; text-align:center; color:#666;">Cargando...</div>
                </div>
                
                <button class="btn-main btn-enter" onclick="saveMyProfile()">Guardar Cambios</button>
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const appState = { user: null, map: null, userMarker: null, markers: {}, currentSelection: null, chatTarget: null, lastNotifId: 0, pendingNotification: null, usersCache: {}, currentRide: null, tempRating: 0 };
        const AVATAR_LIST = [
            'fa-face-smile', 'fa-face-laugh-beam', 'fa-face-grin-stars', 'fa-user-astronaut', 
            'fa-user-ninja', 'fa-user-secret', 'fa-user-tie', 'fa-user-nurse', 
            'fa-ghost', 'fa-robot'
        ];

        // --- AUTH ---
        let selectedRole = 'user';
        let selectedAvatar = 'fa-user'; 

        function initAvatarSelector() {
            const container = document.getElementById('avatar-selector');
            container.innerHTML = '';
            AVATAR_LIST.forEach((icon, index) => {
                const div = document.createElement('div');
                div.className = `avatar-option ${icon === selectedAvatar ? 'selected' : ''}`;
                div.innerHTML = `<i class="fa-solid ${icon}"></i>`;
                div.onclick = () => {
                    selectedAvatar = icon;
                    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
                    div.classList.add('selected');
                };
                container.appendChild(div);
            });
        }

        function selectRole(role) {
            selectedRole = role;
            document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
            document.getElementById(`role-${role}`).classList.add('active');
            
            const extraFields = document.getElementById('service-extra-fields');
            if(role === 'service') extraFields.classList.remove('hidden');
            else extraFields.classList.add('hidden');

            const serviceOptions = document.getElementById('service-options');
            if(role === 'service') serviceOptions.classList.remove('hidden');
            else serviceOptions.classList.add('hidden');
        }

        // CORRECCIÓN: AGREGADO ASYNC A CHECKUSER
        async function checkUser() {
            const phone = document.getElementById('login-phone').value;
            if(!phone) return alert("Ingresa teléfono");
            try {
                const data = await (await fetch(`/api/check-user?phone=${phone}`)).json();
                if(data.found) enterApp(data.user);
                else { document.getElementById('login-view').classList.add('hidden'); document.getElementById('register-view').classList.remove('hidden'); document.getElementById('reg-phone').value = phone; }
            } catch(e) { alert("Error de conexión"); }
        }

        async function registerUser() {
            const name = document.getElementById('reg-name').value;
            const surname = document.getElementById('reg-surname').value;
            const phone = document.getElementById('reg-phone').value;
            
            let details = '';
            let vehicleModel = '';
            let plate = '';

            if(selectedRole === 'service') {
                details = document.getElementById('reg-status').value;
                vehicleModel = document.getElementById('reg-model').value;
                plate = document.getElementById('reg-plate').value;
            }

            const newUser = { 
                id: 'u_'+Date.now(), 
                name: name+' '+surname, 
                phone, 
                role: selectedRole, 
                status: details || 'offline',
                vehicle_model: vehicleModel,
                plate: plate,
                avatar_icon: selectedAvatar, 
                lat: 0, 
                lng: 0 
            };
            
            try {
                await fetch('/api/user', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser) });
                enterApp(newUser);
            } catch(e) { alert("Error registrando"); }
        }
        function showLogin() { document.getElementById('register-view').classList.add('hidden'); document.getElementById('login-view').classList.remove('hidden'); }

        // --- APP MAIN ---
        async function enterApp(user) {
            appState.user = user;
            
            const headerAvatar = document.getElementById('header-avatar');
            const headerIcon = document.getElementById('header-fallback-icon');
            
            if(user.avatar_url) {
                headerAvatar.src = user.avatar_url;
                headerAvatar.style.display = 'block';
                headerIcon.style.display = 'none';
            } else if (user.avatar_icon) {
                headerAvatar.style.display = 'none';
                headerIcon.style.display = 'block';
                headerIcon.className = `fa-solid ${user.avatar_icon}`;
            } else {
                headerAvatar.style.display = 'none';
                headerIcon.style.display = 'block';
                headerIcon.className = 'fa-solid fa-user';
            }

            document.getElementById('display-name').innerText = user.name;
            document.getElementById('display-role').innerText = user.role.toUpperCase();
            if(user.role === 'service') {
                document.getElementById('btn-toggle-status').classList.remove('hidden');
                updateStatusIcon(user.status);
            }
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-header').classList.remove('hidden');

            appState.map = L.map('map').setView([0,0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(appState.map);

            if("geolocation" in navigator) {
                navigator.geolocation.watchPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    user.lat = latitude; user.lng = longitude;
                    if(!appState.userMarker) {
                        appState.map.setView([latitude, longitude], 14);
                    }
                    await fetch('/api/user', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(user) });
                    
                    if(appState.userMarker) appState.map.removeLayer(appState.userMarker);
                    let iconHtml = user.role === 'service' ? '<i class="fa-solid fa-motorcycle"></i>' : `<i class="fa-solid ${user.avatar_icon || 'fa-user'}"></i>`;
                    let iconClass = user.role === 'service' ? 'custom-pin-service' : 'custom-pin-user';
                    const icon = L.divIcon({ className: '', html: `<div class="${iconClass}" style="width:35px; height:35px;">${iconHtml}</div>`, iconSize: [35,35], iconAnchor: [17.5, 17.5] });
                    appState.userMarker = L.marker([latitude, longitude], {icon: icon}).addTo(appState.map);
                }, (err) => { console.warn("GPS error", err); }, { enableHighAccuracy: true });
            }
            startSyncLoop();
        }

        function cycleStatus() {
            const s = appState.user.status === 'online' ? 'offline' : 'online';
            appState.user.status = s;
            updateStatusIcon(s);
            fetch('/api/user', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(appState.user) });
        }
        function updateStatusIcon(s) {
            const i = document.querySelector('#btn-toggle-status i');
            i.className = s === 'online' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
            i.style.color = s === 'online' ? 'var(--primary)' : '#666';
        }

        function startSyncLoop() {
            syncUsers();
            setInterval(syncUsers, 5000);
            setInterval(checkNotifications, 5000);
        }

        async function syncUsers() {
            try {
                const res = await fetch('/api/users');
                const users = await res.json();
                const list = document.getElementById('users-list-content');
                
                if(!users) return;

                const activeIds = users.map(u => u.id);
                Object.keys(appState.markers).forEach(id => {
                    if(!activeIds.includes(id) || id === appState.user.id) {
                         if(appState.markers[id]) {
                             appState.map.removeLayer(appState.markers[id]);
                             delete appState.markers[id];
                         }
                    }
                });

                let listHtml = '';
                users.forEach(u => {
                    if(u.id === appState.user.id) return;
                    appState.usersCache[u.id] = u;
                    
                    let statusColor = u.status === 'online' ? 'var(--primary)' : '#666';
                    let iconHtml = u.avatar_url ? `<img src="${u.avatar_url}" style="width:100%; height:100%; border-radius:50%;">` : `<i class="fa-solid ${u.avatar_icon || 'fa-user'}"></i>`;
                    
                    let statusText = u.role === 'service' ? '🛵 MOTOTAXI' : 'USUARIO';
                    if(u.role === 'service' && u.status === 'occupied') {
                        statusColor = 'var(--danger)'; 
                        statusText = '🛵 OCUPADO';
                    }

                    listHtml += `
                        <div class="user-item" onclick="openModal('${u.id}')">
                            <div class="mini-avatar" style="border: 2px solid ${statusColor}">${iconHtml}<div class="status-dot" style="background:${statusColor}"></div></div>
                            <div><b style="font-size:0.9rem;">${u.name}</b><br><small style="color:${statusColor}; font-weight:bold;">${statusText}</small></div>
                        </div>
                    `;

                    if(!appState.markers[u.id]) {
                        let pinHtml = u.role === 'service' ? '<i class="fa-solid fa-motorcycle"></i>' : `<i class="fa-solid ${u.avatar_icon || 'fa-user'}"></i>`;
                        let pinClass = u.role === 'service' ? 'custom-pin-service' : 'custom-pin-user';
                        const icon = L.divIcon({ className: '', html: `<div class="${pinClass}" style="width:35px; height:35px;">${pinHtml}</div>`, iconSize: [35,35], iconAnchor: [17.5, 17.5] });
                        const marker = L.marker([u.lat, u.lng], {icon: icon}).addTo(appState.map);
                        marker.on('click', () => openModal(u.id));
                        appState.markers[u.id] = marker;
                    } else {
                        appState.markers[u.id].setLatLng([u.lat, u.lng]);
                    }
                });
                
                if(list.innerHTML !== listHtml) {
                    list.innerHTML = listHtml;
                }

                if(appState.currentSelection && appState.usersCache[appState.currentSelection.id]) {
                    const updatedUser = appState.usersCache[appState.currentSelection.id];
                    if(document.getElementById('detail-modal').classList.contains('active')) {
                        updateModalActions(updatedUser);
                    }
                }

            } catch(e){ console.error(e); }
        }

        // --- NOTIFICACIONES ---
        async function checkNotifications() {
            try {
                const res = await fetch(`/api/check-notifications?user_id=${appState.user.id}`);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const notif = data[0];
                    const notifId = notif.id || notif.created_at; 
                    
                    if (notifId != appState.lastNotifId) {
                        appState.lastNotifId = notifId;
                        appState.pendingNotification = notif;
                        
                        showSnackbar(notif);
                        
                        const fab = document.getElementById('notification-fab');
                        fab.classList.add('visible', 'pulse');
                    }
                }
            } catch(e) { console.error(e); }
        }

        function showSnackbar(notif) {
            const container = document.getElementById('snackbar-container');
            const div = document.createElement('div');
            
            const isService = notif.type === 'service_request';
            const typeClass = isService ? 'type-service' : '';
            const title = isService ? "Solicitud de Servicio" : "Nuevo Mensaje";
            const msg = isService ? `${notif.sender_name} te solicita carrera.` : `${notif.sender_name}: ${notif.message || '...'}`;
            const actionBtn = isService ? `<button class="btn-snackbar-action" onclick="rejectService(event)">Rechazar</button>` : '';

            div.className = `snackbar ${typeClass}`;
            div.innerHTML = `
                <div class="snackbar-content" onclick="handleNotificationClick()">
                    <h4>${title}</h4>
                    <p>${msg}</p>
                </div>
                ${actionBtn}
            `;
            
            container.appendChild(div);

            setTimeout(() => {
                div.style.opacity = '0';
                div.style.transform = 'translateY(20px)';
                setTimeout(() => { if(div.parentNode) div.parentNode.removeChild(div); }, 300);
            }, 3000);
        }

        async function rejectService(e) {
            e.stopPropagation();
            if (appState.pendingNotification && appState.pendingNotification.type === 'service_request') {
                try {
                    const res = await fetch(`/api/get-ride-status?my_id=${appState.user.id}&other_id=${appState.pendingNotification.sender_id}`);
                    const ride = await res.json();
                    if (ride) {
                        await updateRideStatus('cancelled', ride.id);
                        alert("Solicitud rechazada");
                    }
                } catch (err) {
                    console.error("Error rechazando", err);
                }
            }
        }

        async function handleNotificationClick() {
            const fab = document.getElementById('notification-fab');
            fab.classList.remove('pulse');
            
            if (!appState.pendingNotification) return;
            const notif = appState.pendingNotification;
            
            try {
                const userRes = await fetch(`/api/get-user-by-id?id=${notif.sender_id}`);
                const userData = await userRes.json();
                if (userData) {
                    appState.currentSelection = userData;
                    appState.chatTarget = userData;
                    openChat(userData);
                }
            } catch(e) { alert("Error abriendo chat"); }
        }

        // --- MODALES & TABS ---
        function toggleUserList() { document.getElementById('users-drawer').classList.toggle('active'); }

        async function openModal(userParam) {
            let u;
            if(typeof userParam === 'string') {
                u = appState.usersCache[userParam];
                if(!u) {
                    try {
                        const res = await fetch(`/api/get-user-by-id?id=${userParam}`);
                        u = await res.json();
                    } catch(e) { return; }
                }
            } else {
                u = userParam;
            }
            if(!u) return;

            appState.currentSelection = u;
            document.getElementById('users-drawer').classList.remove('active');
            
            document.getElementById('modal-name').innerText = u.name;
            document.getElementById('modal-role-text').innerText = u.role === 'service' ? 'CONDUCTOR' : 'USUARIO';
            
            const avatarContainer = document.getElementById('modal-avatar');
            if(u.avatar_url) {
                avatarContainer.innerHTML = `<img src="${u.avatar_url}" style="width:100%; height:100%; border-radius:50%;">`;
            } else {
                avatarContainer.innerHTML = `<i class="fa-solid ${u.avatar_icon || 'fa-user'}"></i>`;
            }

            // Mostrar Rating Promedio si es conductor
            const badge = document.getElementById('modal-rating-badge');
            if(u.role === 'service') {
                badge.classList.remove('hidden');
                fetchDriverRating(u.id);
            } else {
                badge.classList.add('hidden');
            }

            // Mostrar/Ocultar Tabs y datos según rol
            const tabsDiv = document.getElementById('modal-tabs');
            const vehicleInfo = document.getElementById('modal-vehicle-info');
            const paymentInfo = document.getElementById('modal-payment-info');
            const bioInfo = document.getElementById('modal-bio');
            
            if(u.role === 'service') {
                tabsDiv.classList.remove('hidden');
                vehicleInfo.classList.remove('hidden');
                paymentInfo.classList.remove('hidden');
                bioInfo.style.display = 'none'; 
                
                document.getElementById('modal-plate').innerText = u.plate || 'No registrada';
                document.getElementById('modal-model').innerText = u.vehicle_model || 'No especificado';
                
                // Cargar Datos de Pago
                document.getElementById('modal-pay-cedula').innerText = u.pay_cedula || '---';
                document.getElementById('modal-pay-phone').innerText = u.pay_phone || '---';
                document.getElementById('modal-pay-bank').innerText = u.pay_bank || '---';

                // Cargar Historial del conductor
                loadDriverHistory(u.id);

            } else {
                tabsDiv.classList.add('hidden');
                vehicleInfo.classList.add('hidden');
                paymentInfo.classList.add('hidden');
                bioInfo.style.display = 'block';
                document.getElementById('modal-bio').innerText = u.bio || "Sin biografía disponible.";
            }
            
            updateModalActions(u);
            document.getElementById('detail-modal').classList.add('active');
        }

        async function fetchDriverRating(driverId) {
            const valueSpan = document.getElementById('modal-rating-value');
            valueSpan.innerText = '...';
            try {
                const res = await fetch(`/api/get-driver-rating?driver_id=${driverId}`);
                const data = await res.json();
                if(data && data.avg) {
                    valueSpan.innerText = parseFloat(data.avg).toFixed(1);
                } else {
                    valueSpan.innerText = "Nuevo";
                }
            } catch(e) {
                valueSpan.innerText = "Nuevo";
            }
        }

        function switchTab(tabName) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            const buttons = document.querySelectorAll('.tab-btn');
            if(tabName === 'profile') buttons[0].classList.add('active');
            else buttons[1].classList.add('active');

            document.getElementById(`tab-${tabName}`).classList.add('active');
        }

        async function loadDriverHistory(driverId) {
            const list = document.getElementById('driver-history-list');
            list.innerHTML = '<div style="padding:10px; text-align:center; color:#666;">Cargando viajes...</div>';
            try {
                const histRes = await fetch(`/api/history?user_id=${appState.user.id}`);
                const history = await histRes.json();
                list.innerHTML = '';
                
                const driverHistory = history.filter(h => h.driver_name === appState.currentSelection.name);

                if (driverHistory.length === 0) {
                    list.innerHTML = '<div style="padding:10px; text-align:center; color:#666;">Este conductor aún no tiene viajes contigo.</div>';
                } else {
                    driverHistory.forEach(h => {
                        const item = document.createElement('div');
                        item.className = 'history-item';
                        let starsHtml = '';
                        if(h.rating > 0) {
                            for(let i=0; i<5; i++) starsHtml += i < h.rating ? '★' : '☆';
                        } else {
                            starsHtml = 'Sin calificación';
                        }
                        let statusClass = h.status === 'completed' ? 'st-completed' : 'st-cancelled';
                        
                        item.innerHTML = `
                            <div class="history-header">
                                <b>Fecha: ${new Date(h.created_at).toLocaleDateString()}</b>
                                <span class="history-status ${statusClass}">${h.status}</span>
                            </div>
                            <div class="history-stars">Calificación: ${starsHtml}</div>
                        `;
                        list.appendChild(item);
                    });
                }
            } catch(e) {
                console.error(e);
                list.innerHTML = '<div style="padding:10px; text-align:center; color:var(--danger);">Error al cargar historial</div>';
            }
        }

        function updateModalActions(u) {
            const actionsDiv = document.getElementById('modal-actions');
            const btnChat = `<button class="action-btn btn-chat" onclick="openChatFromModal()"><i class="fa-solid fa-comments"></i><span>Chat</span></button>`;
            
            if (appState.user.id === u.id) {
                actionsDiv.innerHTML = `<button class="action-btn btn-profile" onclick="openMyProfile()"><i class="fa-solid fa-pen"></i><span>Editar</span></button><button class="action-btn btn-profile" style="border-color:var(--danger); color:var(--danger);" onclick="alert('Salir')"><i class="fa-solid fa-right-from-bracket"></i><span>Salir</span></button>`;
            } else if (appState.user.role === 'user' && u.role === 'service') {
                if(u.status === 'occupied') {
                    actionsDiv.innerHTML = `<div style="grid-column: span 2; text-align:center; color:var(--danger); padding:10px; font-weight:bold;">Conductor Ocupado</div>${btnChat}`;
                } else if (u.status === 'online') {
                    actionsDiv.innerHTML = `<button class="action-btn btn-request" onclick="startServiceFlow()"><i class="fa-solid fa-flag-checkered"></i><span>Solicitar Servicio</span></button>${btnChat}`;
                } else {
                    actionsDiv.innerHTML = `<div style="grid-column: span 2; text-align:center; color:#888; padding:10px;">Conductor no disponible</div>${btnChat}`;
                }
            } else {
                actionsDiv.innerHTML = `${btnChat}<button class="action-btn btn-profile"><i class="fa-solid fa-info-circle"></i><span>Info</span></button>`;
            }
        }

        function closeModal(id) { document.getElementById(id).classList.remove('active'); }

        // --- CARRERA & RATING ---
        async function startServiceFlow() {
            const driver = appState.currentSelection;
            closeModal('detail-modal');
            await fetch('/api/request-service', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ client_id: appState.user.id, driver_id: driver.id, client_name: appState.user.name }) });
            appState.chatTarget = driver;
            setupChatUI(driver.name, driver.status);
            document.getElementById('chat-modal').classList.add('active');
            loadMessages(driver.id);
            checkRideStatus(); 
        }

        function openChatFromModal() {
            const target = appState.currentSelection;
            closeModal('detail-modal');
            openChat(target);
        }

        async function openChat(target) {
            appState.chatTarget = target;
            setupChatUI(target.name, target.status);
            document.getElementById('chat-modal').classList.add('active');
            loadMessages(target.id);
            checkRideStatus();
        }

        function setupChatUI(name, status) {
            document.getElementById('chat-with-name').innerText = name;
            document.getElementById('chat-user-status').innerText = status === 'online' ? '🟢 En línea' : status === 'occupied' ? '🔴 Ocupado' : '⚫ Desconectado';
        }

        async function loadMessages(targetId) {
            const msgs = await (await fetch(`/api/messages/${targetId}?me=${appState.user.id}`)).json();
            const container = document.getElementById('chat-messages');
            container.innerHTML = '';
            if(msgs) {
                msgs.forEach(m => {
                    const isMe = m.sender_id === appState.user.id;
                    const div = document.createElement('div');
                    div.className = `msg ${isMe ? 'msg-own' : 'msg-other'}`;
                    div.innerText = m.message;
                    container.appendChild(div);
                });
            }
            container.scrollTop = container.scrollHeight;
        }

        async function sendMessage() {
            const input = document.getElementById('chat-input');
            const txt = input.value.trim();
            if(!txt || !appState.chatTarget) return;
            await fetch('/api/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sender_id: appState.user.id, receiver_id: appState.chatTarget.id, message: txt }) });
            input.value = '';
            loadMessages(appState.chatTarget.id);
        }

        let rideCheckInterval;
        async function checkRideStatus() {
            if(rideCheckInterval) clearInterval(rideCheckInterval);
            const updateUI = async () => {
                if(!appState.chatTarget) return;
                try {
                    const res = await fetch(`/api/get-ride-status?my_id=${appState.user.id}&other_id=${appState.chatTarget.id}`);
                    const ride = await res.json();
                    const panel = document.getElementById('ride-control-panel');
                    const actions = document.getElementById('ride-actions-container');
                    const statusText = document.getElementById('ride-status-text');
                    
                    if(!ride) { 
                        panel.classList.add('hidden'); 
                        return; 
                    }
                    
                    panel.classList.remove('hidden');
                    appState.currentRide = ride;
                    statusText.innerText = "Estado: " + ride.status.toUpperCase();
                    actions.innerHTML = '';
                    
                    if(ride.status === 'pending') {
                        if(appState.user.id === ride.driver_id) {
                            actions.innerHTML = `
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                    <button class="btn-ride btn-accept" onclick="updateRideStatus('accepted', '${ride.id}')">✅ Aceptar</button>
                                    <button class="btn-ride btn-reject" onclick="updateRideStatus('cancelled', '${ride.id}')">❌ Rechazar</button>
                                </div>
                            `;
                        } else {
                            actions.innerHTML = `<div style="text-align:center; padding:10px; color:#aaa;">Esperando que el taxista acepte...</div>`;
                        }
                    } else if(ride.status === 'accepted') {
                        if(appState.user.id === ride.driver_id) {
                            await setUserStatus('occupied');
                            actions.innerHTML = `<button class="btn-ride btn-finish" onclick="updateRideStatus('active', '${ride.id}')">🏁 Llegué (Terminar)</button>`;
                        }
                        else actions.innerHTML = `<div style="text-align:center; padding:10px; color:var(--primary);">🛵 El taxista va en camino...</div>`;
                    } else if(ride.status === 'active') {
                        if(appState.user.id === ride.client_id) {
                            // USUARIO CONFIRMA LLEGADA -> ABRE RATING MODAL
                            actions.innerHTML = `<button class="btn-ride btn-finish" onclick="openRatingModal()">📍 He llegado a mi destino</button>`;
                        } else {
                            actions.innerHTML = `<div style="text-align:center; padding:10px; color:#aaa;">Esperando que el cliente confirme llegada...</div>`;
                        }
                    } else if(ride.status === 'completed') {
                        panel.classList.add('hidden'); 
                    } else if (ride.status === 'cancelled') {
                        panel.classList.add('hidden');
                        if(appState.user.role === 'service') await setUserStatus('online');
                    }
                } catch(e) { console.error(e); }
            };
            updateUI(); 
            rideCheckInterval = setInterval(updateUI, 3000);
        }

        async function setUserStatus(status) {
            appState.user.status = status;
            updateStatusIcon(status);
            fetch('/api/user', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(appState.user) });
        }

        async function updateRideStatus(newStatus, rideId) {
            const idToUpdate = rideId || appState.currentRide.id;
            if(!idToUpdate) return;
            
            await fetch('/api/update-ride', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ rideId: idToUpdate, status: newStatus }) });
            
            if(newStatus === 'cancelled') {
                 document.getElementById('ride-control-panel').classList.add('hidden');
                 if(appState.chatTarget) {
                     await fetch('/api/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sender_id: appState.user.id, receiver_id: appState.chatTarget.id, message: "❌ Servicio rechazado." }) });
                     loadMessages(appState.chatTarget.id);
                 }
                 if(appState.user.role === 'service') await setUserStatus('online');
            } else {
                checkRideStatus();
            }
        }

        function showArrivalOptions() {
            const actions = document.getElementById('ride-actions-container');
            actions.innerHTML = `<p style="text-align:center; margin-bottom:10px;">¿Llegaste a tu destino?</p><div class="final-actions"><button class="btn-ride btn-accept" onclick="finalizeRide('completed')">SÍ</button><button class="btn-ride btn-sec-ride" onclick="showCancelOptions()">NO</button></div>`;
        }
        function showCancelOptions() {
            const actions = document.getElementById('ride-actions-container');
            actions.innerHTML = `<p style="text-align:center; margin-bottom:10px;">¿Qué sucedió?</p><div class="final-actions"><button class="btn-ride btn-cancel" onclick="finalizeRide('cancelled')">Cancelado</button><button class="btn-ride btn-sec-ride" onclick="finalizeRide('other')">Otra Cosa</button></div>`;
        }

        async function finalizeRide(status) {
            await updateRideStatus(status);
            await fetch('/api/save-history', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ user_id: appState.user.id, driver_name: appState.chatTarget.name, status: status, rating: 0 }) });
            if(status === 'completed') { 
                // No hacemos nada aquí, esperamos el modal de rating
            } else { document.getElementById('ride-control-panel').classList.add('hidden'); }
        }

        // --- NUEVO: SISTEMA DE RATING OPCIONAL ---
        function openRatingModal() {
            // Resetear estrellas temporales
            appState.tempRating = 0;
            document.querySelectorAll('#star-container span').forEach(s => s.classList.remove('active'));
            document.getElementById('rating-comment').value = "";
            document.getElementById('rating-modal').classList.add('active');
        }

        function setTempRating(n) {
            appState.tempRating = n;
            const spans = document.querySelectorAll('#star-container span');
            spans.forEach((s, i) => s.classList.toggle('active', i < n));
        }

        async function submitRating() {
            const comment = document.getElementById('rating-comment').value;
            // 1. Enviar Rating Individual
            await fetch('/api/submit-rating', { 
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify({ 
                    driver_id: appState.chatTarget.id, 
                    user_id: appState.user.id,
                    stars: appState.tempRating, 
                    comment: comment 
                }) 
            });
            
            // 2. Guardar Historial con el rating elegido
            await fetch('/api/save-history', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id: appState.user.id, driver_name: appState.chatTarget.name, status: 'completed', rating: appState.tempRating }) });
            
            // 3. Limpiar interfaz y poner online
            document.getElementById('rating-modal').classList.remove('active');
            document.getElementById('chat-modal').classList.remove('active');
            document.getElementById('ride-control-panel').classList.add('hidden');
            
            if(appState.user.role === 'service') await setUserStatus('online');
        }

        function skipRating() { 
            // Si cierra sin calificar, guardamos rating 0
            fetch('/api/save-history', { 
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify({ 
                    user_id: appState.user.id, 
                    driver_name: appState.chatTarget.name, 
                    status: 'completed', 
                    rating: 0 
                }) 
            });
            document.getElementById('rating-modal').classList.remove('active');
            document.getElementById('ride-control-panel').classList.add('hidden');
            if(appState.user.role === 'service') await setUserStatus('online');
        }

        // PERFIL PROPIO
        async function openMyProfile() {
            if(!appState.user) return;
            initAvatarSelector(); 
            
            if(appState.user.avatar_icon) {
                selectedAvatar = appState.user.avatar_icon;
                document.querySelectorAll('.avatar-option').forEach(el => {
                    if(el.innerHTML.includes(selectedAvatar)) el.classList.add('selected');
                    else el.classList.remove('selected');
                });
            }

            document.getElementById('edit-bio').value = appState.user.bio || "";
            
            if(appState.user.role === 'service') {
                document.getElementById('driver-payment-fields').classList.remove('hidden');
                document.getElementById('pay-cedula').value = appState.user.pay_cedula || "";
                document.getElementById('pay-phone').value = appState.user.pay_phone || "";
                document.getElementById('pay-bank').value = appState.user.pay_bank || "";
            } else {
                document.getElementById('driver-payment-fields').classList.add('hidden');
            }

            const list = document.getElementById('my-history-list');
            list.innerHTML = '<div style="padding:10px; text-align:center; color:#666;">Cargando...</div>';
            try {
                const histRes = await fetch(`/api/history?user_id=${appState.user.id}`);
                const history = await histRes.json();
                list.innerHTML = '';
                
                if (!history || history.length === 0) {
                    list.innerHTML = '<div style="padding:10px; text-align:center; color:#666;">Sin historial</div>';
                } else {
                    history.forEach(h => {
                        const item = document.createElement('div');
                        item.className = 'history-item';
                        let starsHtml = '';
                        if(h.rating > 0) {
                            for(let i=0; i<5; i++) starsHtml += i < h.rating ? '★' : '☆';
                        } else {
                            starsHtml = 'Sin calificación';
                        }
                        let statusClass = h.status === 'completed' ? 'st-completed' : 'st-cancelled';
                        item.innerHTML = `
                            <div class="history-header">
                                <b>${h.driver_name}</b>
                                <span class="history-status ${statusClass}">${h.status}</span>
                            </div>
                            <div class="history-stars">${starsHtml}</div>
                        `;
                        list.appendChild(item);
                    });
                }
            } catch(e){ 
                console.error(e); 
                list.innerHTML = '<div style="padding:10px; text-align:center; color:var(--danger);">Error cargando historial</div>';
            }
            document.getElementById('profile-modal').classList.add('active');
        }

        async function saveMyProfile() {
            const newBio = document.getElementById('edit-bio').value;
            
            appState.user.bio = newBio;
            appState.user.avatar_icon = selectedAvatar;
            appState.user.avatar_url = ""; 

            if(appState.user.role === 'service') {
                appState.user.pay_cedula = document.getElementById('pay-cedula').value;
                appState.user.pay_phone = document.getElementById('pay-phone').value;
                appState.user.pay_bank = document.getElementById('pay-bank').value;
            }

            const headerAvatar = document.getElementById('header-avatar');
            const headerIcon = document.getElementById('header-fallback-icon');
            headerAvatar.style.display = 'none';
            headerIcon.style.display = 'block';
            headerIcon.className = `fa-solid ${selectedAvatar}`;

            await fetch('/api/update-profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(appState.user) });
            closeModal('profile-modal');
        }

        document.getElementById('chat-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
    </script>
</body>
</html>
```

### 3. Archivo: `functions/api/[[path].js` (Backend con tabla `ratings`)

Este archivo gestiona la lógica de guardar calificaciones individuales y calcular promedios.

```javascript
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const DB = env.DB; 

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
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
        INSERT INTO users (id, name, phone, role, lat, lng, details, bio, avatar_url, avatar_icon, status, last_seen, created_at, vehicle_model, plate, pay_cedula, pay_phone, pay_bank) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
          name = excluded.name, 
          phone = excluded.phone, 
          role = excluded.role,
          lat = excluded.lat, 
          lng = excluded.lng, 
          details = excluded.details,
          bio = excluded.bio, 
          avatar_url = excluded.avatar_url,
          avatar_icon = excluded.avatar_icon,
          status = excluded.status, 
          last_seen = datetime('now'),
          vehicle_model = excluded.vehicle_model,
          plate = excluded.plate,
          pay_cedula = COALESCE(excluded.pay_cedula, ?),
          pay_phone = COALESCE(excluded.pay_phone, ?),
          pay_bank = COALESCE(excluded.pay_bank, ?)
      `).bind(
        data.id, data.name, data.phone, data.role, data.lat, data.lng, 
        (data.details||''), (data.bio||''), (data.avatar_url||''), (data.avatar_icon||'fa-user'), (data.status||'offline'),
        (data.vehicle_model || null), (data.plate || null),
        (data.pay_cedula || null), (data.pay_phone || null), (data.pay_bank || null),
        (data.pay_cedula || null), (data.pay_phone || null), (data.pay_bank || null)
      ).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- USERS LIST ---
    if (url.pathname === "/api/users" && request.method === "GET") {
      const { results } = await DB.prepare(`SELECT * FROM users WHERE last_seen > datetime('now', '-90 seconds') ORDER BY last_seen DESC`).all();
      return new Response(JSON.stringify(results || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- UPDATE PROFILE ---
    if (url.pathname === "/api/update-profile" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare(`
        UPDATE users SET 
          bio = ?, 
          avatar_url = ?, 
          avatar_icon = ?,
          pay_cedula = COALESCE(?, pay_cedula),
          pay_phone = COALESCE(?, pay_phone),
          pay_bank = COALESCE(?, pay_bank)
        WHERE id = ?
      `).bind(data.bio, data.avatar_url, data.avatar_icon, data.pay_cedula, data.pay_phone, data.pay_bank, data.id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- MESSAGES ---
    if (url.pathname === "/api/messages" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?, datetime('now'))").bind(data.sender_id, data.receiver_id, data.message).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (url.pathname.startsWith("/api/messages/") && request.method === "GET") {
      const otherUserId = url.pathname.split("/").pop();
      const myId = url.searchParams.get("me");
      const { results } = await DB.prepare(`SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`).bind(myId, otherUserId, otherUserId, myId, myId).all();
      return new Response(JSON.stringify(results || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    // --- SERVICIOS ---
    if (url.pathname === "/api/request-service" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare(`INSERT INTO service_requests (client_id, driver_id, client_name, status, created_at) VALUES (?, ?, ?, 'pending', datetime('now'))`).bind(data.client_id, data.driver_id, data.client_name).run();
      await DB.prepare(`INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, '📢 SOLICITUD DE SERVICIO', datetime('now'))`).bind(data.client_id, data.driver_id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/get-ride-status" && request.method === "GET") {
      const myId = url.searchParams.get("my_id");
      const otherId = url.searchParams.get("other_id");
      const ride = await DB.prepare(`SELECT * FROM service_requests WHERE ((client_id = ? AND driver_id = ?) OR (client_id = ? AND driver_id = ?)) AND status IN ('pending', 'accepted', 'active') ORDER BY created_at DESC LIMIT 1`).bind(myId, otherId, otherId, myId, myId).first();
      return new Response(JSON.stringify(ride || null), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/update-ride" && request.method === "POST") {
      const data = await request.json();
      await DB.prepare("UPDATE service_requests SET status = ? WHERE id = ?").bind(data.status, data.rideId).run();
      if(data.rating) {
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
      let history = [];
      try {
        const { results } = await DB.prepare("SELECT * FROM ride_history WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
        history = results || [];
      } catch(e) { history = []; }
      return new Response(JSON.stringify(history), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- NUEVO: SISTEMA DE RATING INDIVIDUAL ---
    if (url.pathname === "/api/submit-rating" && request.method === "POST") {
        const data = await request.json();
        await DB.prepare(`INSERT INTO ratings (driver_id, user_id, stars, comment, created_at) VALUES (?, ?, ?, ?, datetime('now'))`)
            .bind(data.driver_id, data.user_id, data.stars, data.comment).run();
        
        await DB.prepare(`INSERT INTO ride_history (user_id, driver_name, status, rating, created_at) VALUES (?, ?, ?, ?, datetime('now'))`)
            .bind(data.user_id, data.driver_name, 'completed', data.stars).run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/get-driver-rating" && request.method === "GET") {
      const driverId = url.searchParams.get("driver_id");
      const result = await DB.prepare(`SELECT AVG(stars) as avg, COUNT(*) as count FROM ratings WHERE driver_id = ?`).bind(driverId).first();
      return new Response(JSON.stringify({ avg: result ? result.avg : 0, count: result ? result.count : 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- CHECK NOTIFICATIONS ---
    if (url.pathname === "/api/check-notifications" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      let notifications = [];

      try {
        try {
          const msg = await DB.prepare(`
            SELECT m.id, m.message, m.sender_id, m.created_at, u.name as sender_name, 'message' as type
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = ? AND m.sender_id != ?
            ORDER BY m.created_at DESC LIMIT 1
          `).bind(userId, userId).first();
          if (msg) notifications.push(msg);
        } catch (e) { console.error(e); }

        try {
          const req = await DB.prepare(`
            SELECT sr.id, sr.client_id as sender_id, sr.created_at, u.name as sender_name, 'service_request' as type
            FROM service_requests sr
            JOIN users u ON sr.client_id = u.id
            WHERE sr.driver_id = ? AND sr.status = 'pending'
            ORDER BY sr.created_at DESC LIMIT 1
          `).bind(userId).first();
          if (req) notifications.push(req);
        } catch (e) { console.error(e); }

      } catch (err) { console.error(err); }

      notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return new Response(JSON.stringify(notifications), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });

  } catch (err) {
    return new Response("Server Error: " + err.message, { status: 500, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
  }
}
```