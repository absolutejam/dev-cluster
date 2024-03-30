FROM woodpeckerci/plugin-git

ARG cert

RUN \
  echo "${cert}" > /usr/local/share/ca-certificates/ca-cert.crt && \
  update-ca-certificates
