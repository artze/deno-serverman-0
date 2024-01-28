import * as serverman from "@src/mod.ts";

const app = serverman.createApp();

app.use(() => {
  console.log("General handler 1");
});
app.use(() => {
  console.log("General handler 2");
});

const catRouter = serverman.createRouter();
catRouter.use((ctx) => {
  console.log("General cat router");
  ctx.res.status = 200;
});
catRouter.use("/calico", () => {
  console.log("Calico cat router");
});
catRouter.get("/calico/:id", () => {
  console.log("Calico cat :id route");
});

const dogRouter = serverman.createRouter();
dogRouter.use((ctx) => {
  console.log("General dog router");
  ctx.res.status = 200;
});
dogRouter.use("/labrador", () => {
  console.log("Labrador dog router");
});

app.use("/cat", catRouter.handlerFn);
app.use("/dog", dogRouter.handlerFn);

app.listen({ port: 3000 });
