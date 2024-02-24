import * as serverman from "@src/mod.ts";

const app = serverman.createApp();

app.use(async (_ctx, next) => {
  console.log("General handler 1");
  await next();
});
app.use(async (_ctx, next) => {
  console.log("General handler 2");
  await next();
});

const catRouter = serverman.createRouter();
catRouter.use(async (ctx, next) => {
  console.log("General cat router");
  ctx.res.status = 200;
  await next();
});
catRouter.use("/calico", async (_ctx, next) => {
  console.log("Calico cat router");
  await next();
});
catRouter.get("/calico/:id", () => {
  console.log("Calico cat :id route");
});

const dogRouter = serverman.createRouter();
dogRouter.use(async (ctx, next) => {
  console.log("General dog router");
  ctx.res.status = 200;
  await next();
});
dogRouter.use("/labrador", async (_ctx, next) => {
  console.log("Labrador dog router");
  await next();
});

app.use("/cat", catRouter.handlerFn);
app.use("/dog", dogRouter.handlerFn);

app.listen({ port: 3000 });
