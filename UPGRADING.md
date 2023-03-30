# Upgrading

## 1.2.0+

Prom Client 13 and 14 have been supported. No functionality changes have been made.

## 1.1.0+

The npm library `prom-client` has been moved to be a peer dependency. This means that you will need to ensure that this
is installed as well. As of 1.1.0 the peer dependency for prom client has been fixed at [v11, v12] as currently this
library does not support greater than this without code change (i.e. v13+).
