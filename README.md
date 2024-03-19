Live application - https://breadit-chi.vercel.app/

Backend repo - https://github.com/adhupraba/breadit-server

---

Inorder to test cross-site cookies sharing install `ngrok` and `localtunnel` cli tools

> Cross site cookies are cookies set in the client from a different domain. Client and server are under different domains. eg: Client - https://www.abc.com, Server - https://www.def.com

---

run the web using the command

```bash
ngrok http 3000
```

run the server using the command

```bash
lt --port 8000
```

---

Normally cross-site cookies are not sent to the server if server is in a different domain. So as a work around what is done is to implement a `api path rewrite` in the `next.config.js`

All backend requests from the ui are made to a dummy `/api/gateway/...` nextjs api endpoint which in turn gets redirected to the actual backend api due to the rewrite rule

In this way we are able to send our own cross site cookies to our server which was previously not possible
