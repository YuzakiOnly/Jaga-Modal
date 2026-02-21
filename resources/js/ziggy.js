const Ziggy = {"url":"http:\/\/localhost:8000","port":8000,"defaults":{},"routes":{"login":{"uri":"login","methods":["GET","HEAD"]},"register":{"uri":"register","methods":["GET","HEAD"]},"verify.email":{"uri":"verify-email","methods":["GET","HEAD"]},"verify.email.submit":{"uri":"verify-email","methods":["POST"]},"verify.email.resend":{"uri":"verify-email\/resend","methods":["POST"]},"logout":{"uri":"logout","methods":["POST"]},"profile.update":{"uri":"profile","methods":["PUT"]},"store.setup":{"uri":"setup-store","methods":["GET","HEAD"]},"store.setup.save":{"uri":"setup-store","methods":["POST"]},"language.switch":{"uri":"language\/switch","methods":["POST"]},"storage.local":{"uri":"storage\/{path}","methods":["GET","HEAD"],"wheres":{"path":".*"},"parameters":["path"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
