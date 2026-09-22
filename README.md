# Nuntiun

Portal de notícias feito para rodar com **custo zero**: hospedagem na Vercel (Hobby), banco de dados em tempo real no Firebase (plano Spark) e armazenamento de imagens no próprio GitHub, usando a Contents API — sem precisar de um serviço de storage pago.

## Por que imagens ficam no GitHub?

Para não gastar com um serviço de storage, as imagens das notícias são commitadas diretamente neste repositório via API, na branch `images` (separada da `main`, pra não misturar histórico de código com uploads de imagem). Cada upload feito pelo painel admin gera um commit nessa branch com a nova imagem; cada exclusão gera um commit removendo o arquivo.

O token usado para isso é um *fine-grained personal access token*, com acesso restrito só a este repositório e só à permissão de leitura/escrita de conteúdo (Contents) — sem acesso a nenhuma outra parte da conta do GitHub.