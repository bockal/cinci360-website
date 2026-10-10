# Local Bell photogrammetry pilot. CPU-first to work on Surface Book 2.
# Pin image digest before production use.
FROM colmap/colmap:3.11.1
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip imagemagick && rm -rf /var/lib/apt/lists/*
WORKDIR /work
COPY run_bell.sh /usr/local/bin/run_bell
RUN chmod +x /usr/local/bin/run_bell
ENTRYPOINT ["/usr/local/bin/run_bell"]
