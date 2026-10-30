This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Testar conexão com o servidor

Execute `npm run dev` e abra `http://localhost:3000/teste-conexao`. Clique em
**Verificar conexão** para enviar uma requisição do navegador ao endpoint
`/api/health`. Uma resposta JSON também pode ser conferida diretamente em
`http://localhost:3000/api/health`.

Para publicar na Vercel:

1. Envie o projeto para um repositório Git e importe esse repositório em
   [vercel.com/new](https://vercel.com/new).
2. Mantenha o framework como **Next.js**, a pasta raiz como `.` e o comando de
   build como `npm run build`.
3. Após o deploy, acesse `https://SEU-DOMINIO/teste-conexao` e clique no botão.
   O endpoint `https://SEU-DOMINIO/api/health` deve responder com JSON e
   `"status": "ok"`.

Essa verificação confirma a comunicação entre o navegador e o servidor Next.js;
ela não testa banco de dados nem autenticação. Um arquivo PHP dentro de `api/`
não se torna automaticamente uma rota do Next.js. Para validar login ou banco,
será necessário configurar a integração correspondente separadamente.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
