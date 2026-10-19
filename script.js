var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- código dentro das letras do nome ----------------------------------

var snippet = [
  "Route::get('/clientes/{id}', [ClienteController::class, 'show']);",
  "$fatura = Fatura::where('cliente_id', $id)->latest()->first();",
  "return response()->json(['status' => 'ok', 'data' => $fatura]);",
  "SELECT regiao, AVG(tma) FROM ordens GROUP BY regiao;",
  "Http::pool(fn (Pool $pool) => [$pool->get($erpA), $pool->get($erpB)]);",
  "if ($sistema->emQuarentena()) { continue; }",
  "dispatch(new EnviarNotificacao($cliente))->onQueue('push');",
  "docker compose -f compose.prod.yaml up -d --build",
  "def checar_replica(conn): return conn.execute(LAG_SQL).scalar()",
  "Cache::remember(\"cliente:$id\", 300, fn () => $erp->buscar($id));",
  "php artisan migrate --force && php artisan optimize",
  "await telegram.send(f'réplica atrasada: {lag}s')",
  "public function handle(Request $request, Closure $next): Response",
  "git commit -m 'corrige timeout do gateway'",
];

var colors = ["#7ea0ff", "#e6ecff", "#5ce0c6", "#ffcf6b", "#9db4ff"];

function drawCode() {
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 900, h = 640, lh = 17;
  var c = document.createElement("canvas");
  c.width = w * dpr;
  c.height = h * dpr;
  var ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#0a1a44";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.textBaseline = "top";

  for (var i = 0; i * lh < h; i++) {
    var line = snippet[i % snippet.length];
    var indent = (i * 7) % 5 * 16;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillText(line, indent, i * lh);
    ctx.fillText(line, indent + 520, i * lh); // preenche a largura toda
  }

  return { url: c.toDataURL(), w: w, h: h };
}

var nameEl = document.querySelector(".name");
var codeLayer = document.querySelector(".name .code");

if (nameEl && codeLayer) {
  function paintCode() {
    var tile = drawCode();
    codeLayer.style.backgroundImage = "url(" + tile.url + ")";
    codeLayer.style.backgroundSize = tile.w + "px " + tile.h + "px";
  }

  paintCode();
  // redesenha quando a fonte mono terminar de carregar
  if (document.fonts) document.fonts.ready.then(paintCode);

  var lastPointer = 0;
  var target = { x: 0, y: 0 };
  var pos = { x: 0, y: 0 };

  nameEl.addEventListener("pointermove", function (e) {
    var r = nameEl.getBoundingClientRect();
    target.x = e.clientX - r.left;
    target.y = e.clientY - r.top;
    lastPointer = performance.now();
  });

  function frame(t) {
    var r = nameEl.getBoundingClientRect();

    // sem mouse em cima, o círculo passeia sozinho pelo nome
    if (t - lastPointer > 1500) {
      target.x = r.width * (0.5 + 0.42 * Math.sin(t / 2600));
      target.y = r.height * (0.5 + 0.35 * Math.sin(t / 1700));
    }

    pos.x += (target.x - pos.x) * 0.08;
    pos.y += (target.y - pos.y) * 0.08;

    codeLayer.style.setProperty("--mx", pos.x + "px");
    codeLayer.style.setProperty("--my", pos.y + "px");
    codeLayer.style.backgroundPosition = "0 " + (-t / 40) + "px";

    requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    codeLayer.style.setProperty("--mx", "70%");
    codeLayer.style.setProperty("--my", "30%");
  } else {
    requestAnimationFrame(frame);
  }
}

// --- barra de progresso ------------------------------------------------

var bar = document.querySelector(".progress");

function updateProgress() {
  var max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

// --- seções aparecem ao rolar ------------------------------------------

if ("IntersectionObserver" in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
} else {
  document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
}

// --- clicar no e-mail copia o endereço ---------------------------------

document.querySelectorAll(".copy").forEach(function (link) {
  link.addEventListener("click", function (e) {
    if (!navigator.clipboard) return; // sem suporte: deixa o mailto: seguir

    e.preventDefault();
    navigator.clipboard.writeText(link.dataset.copy).then(function () {
      var original = link.textContent;
      link.classList.add("done");
      if (link.classList.contains("btn")) link.textContent = "Copiado!";

      setTimeout(function () {
        link.classList.remove("done");
        link.textContent = original;
      }, 1800);
    });
  });
});
