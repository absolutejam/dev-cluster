package validate_pki

import rego.v1

violation contains "No 'pki' data found" if not data.pki

certificates contains value if {
  input.kind == "List"
  some k, value in input.items
  value.kind == "Certificate"
}

required_certs = [
  data.pki.selfSignedCaName,
  "istio-ingress-tls-cert",
]

violation contains reason if {
  cert_names = [cert.metadata.name | 
    some _, cert in certificates
  ]
  some _, required_cert in required_certs
  not required_cert in cert_names
  reason := sprintf("Missing required cert: %s", [required_cert])
}
