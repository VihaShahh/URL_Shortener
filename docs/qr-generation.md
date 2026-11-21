# Static QR generation

## Payload and service boundary

The public `/qr` route encodes the URL supplied by the visitor directly into QR
artwork. It does not call link creation, create an account, allocate a short code,
or resolve the destination. The generation module is
[qr-code.ts](../client/src/lib/qr-code.ts); the interface is
[static-qr-generator.tsx](../client/src/features/qr/static-qr-generator.tsx).

Validation requires an absolute HTTP(S) URL with a hostname, no embedded username
or password, and no whitespace or control characters inside the trimmed value.
The input is limited to 2,048 UTF-8 bytes. Validation uses the URL parser but does
not serialize its result: the original trimmed value, including Unicode, query
strings, percent escapes, and fragments, is the encoded payload.

Local/internal hostnames are valid for standalone encoding because neither the
browser feature nor the server fetches or redirects to the destination. This is
separate from the backend's public-redirect destination policy. If the visitor
supplies an existing short URL, that URL and its own service dependencies are
retained; this feature never inserts a platform URL automatically.

## Artwork contract

The `qrcode` library performs QR encoding and produces both formats from the same
payload and rendering settings. Error correction is M, the quiet zone is four
modules, and PNG output is 1,024 pixels square. SVG remains vector artwork. Both
formats use opaque backgrounds and one of three dark-on-light presets; arbitrary
colors and uploaded logos are outside this feature's input surface.

SVG is generated from the encoded module matrix, rather than interpolating the
input as markup. No user HTML, script, or external image is embedded. Both export
formats must finish successfully before the interface offers either download.

## State and failure semantics

Every destination or preset change invalidates the current artwork immediately.
Preview and download controls are tied to the same completed artwork object. A
generation revision prevents an older asynchronous completion from restoring
artwork after input changes, a newer generation, or component unmount.

Invalid input and rendering failures produce an accessible form error, leave
downloads disabled, and permit a new attempt. They do not fall back to an old
destination. The form exposes separate labels and help text, and announces its
generation result separately from navigation announcements.

Downloads use temporary Blob URLs with fixed filenames, `static-qr.png` and
`static-qr.svg`. Blob URLs are revoked after the browser begins the download.
Destination text is displayed through React text rendering, not HTML insertion.

## Privacy and availability

The generator does not persist URLs in cookies or local storage and does not send
them to the link API, a QR-image service, or the destination website. The QR page
omits the backend status component so backend availability is not a prerequisite.
The browser still loads the site's own frontend assets. Once those assets have
loaded, generation and downloads work without a network connection; this does
not imply an offline installation or first-load cache.

Downloaded static artwork contains the chosen destination and adds no platform
subscription or expiration requirement. The destination's own availability and
policies still apply. Static artwork has no platform scan analytics or editable
destination; it is not a paid dynamic campaign.

## Verification boundary

Unit tests exercise input semantics, byte limits, invalid schemes and credentials,
and real PNG/SVG output. Browser acceptance downloads actual files for every
preset and representative Unicode, query/fragment, and markup-shaped inputs.
An independent jsQR decoder reads PNG pixels and SVG rasterized by Sharp, rather
than checking only that the encoder returned a string.

The browser suite rejects backend and third-party requests from the QR page,
checks that URLs are not persisted, tests rendering failure and stale artwork,
and repeats the flows in desktop and mobile Chromium layouts. Offline tests begin
after the page is loaded. This evidence does not establish physical scanner or
print-size acceptance; scan actual proofs on target devices before a print run.

Dynamic QR will require stable platform URLs, authenticated ownership, audited
destination edits, and server-side entitlements. Its billing contract must keep
safe redirects at the last destination after paid editing access lapses. Those
account, billing, and redirect changes remain a separate implementation phase.
