#!/usr/bin/env python3
"""Servidor local para «21 de septiembre». Solo usa la biblioteca estándar de Python 3.8+.

No es obligatorio: la página funciona igual con solo abrir index.html con doble
clic. Este script es para quienes prefieran ver la dirección en la terminal,
abrir el navegador solos, o probarla desde el celular en la misma Wi-Fi.

Uso:
  python3 server.py                       abre http://127.0.0.1:8000
  python3 server.py --para Valeria        deja listo el enlace con el nombre
  python3 server.py --red                 también accesible desde tu celular (misma Wi-Fi)
  python3 server.py --abrir               abre el navegador solo
  python3 server.py --puerto 8080         cambia el puerto
"""
from __future__ import annotations

import argparse
import mimetypes
import socket
import sys
import threading
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote

RAIZ = Path(__file__).resolve().parent
MAX_NOMBRE = 40   # mismo límite que js/config.js

# Windows a veces registra .js como text/plain y el navegador lo rechaza
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("audio/mpeg", ".mp3")


def ip_local() -> str | None:
    """IP de esta máquina en la red local (no envía ningún paquete)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


class Manejador(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")   # que los cambios se vean al recargar
        super().end_headers()

    def send_head(self):
        if self.path.split("?", 1)[0].endswith(".py"):   # no servir el código del servidor
            self.send_error(404, "No encontrado")
            return None
        return super().send_head()

    def log_request(self, code="-", size="-"):
        if str(code)[0] not in "23":                     # solo se muestran los errores
            super().log_request(code, size)


def main() -> None:
    ap = argparse.ArgumentParser(description="Servidor local de «21 de septiembre».")
    ap.add_argument("--puerto", type=int, default=8000, help="puerto (por defecto 8000)")
    ap.add_argument("--para", default="", help="nombre de la persona; se agrega al enlace como ?para=")
    ap.add_argument("--red", action="store_true", help="permite abrirla desde otros dispositivos de la misma red")
    ap.add_argument("--abrir", action="store_true", help="abre el navegador automáticamente")
    args = ap.parse_args()

    try:
        servidor = ThreadingHTTPServer(("0.0.0.0" if args.red else "127.0.0.1", args.puerto),
                                       partial(Manejador, directory=str(RAIZ)))
    except OSError as e:
        sys.exit(f"No se pudo usar el puerto {args.puerto}: {e}. Prueba con --puerto 8080")

    nombre = args.para.strip()[:MAX_NOMBRE]
    sufijo = f"?para={quote(nombre)}" if nombre else ""
    url = f"http://127.0.0.1:{args.puerto}/{sufijo}"
    print(f"\n  Abre:  {url}")
    if args.red:
        ip = ip_local()
        if ip:
            print(f"  Celular en la misma Wi-Fi:  http://{ip}:{args.puerto}/{sufijo}")
    print("  Ctrl+C para detener\n")
    if args.abrir:
        threading.Timer(.6, webbrowser.open, [url]).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\n  Servidor detenido.")
    finally:
        servidor.server_close()


if __name__ == "__main__":
    main()
