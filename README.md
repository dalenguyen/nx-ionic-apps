# Ionic Apps with Nx Workspace

Build mobile apps with Ionic Frameworks & Nx Workspace

## Create workspace

```
npx create-nx-workspace my-org --preset=empty
yarn add @nrwl/angular
yarn add -D @nxtend/capacitor
```

## Generate Angular Applications

```
yarn add -D @nxtend/ionic-angular
nx generate @nxtend/ionic-angular:init
nx generate @nxtend/ionic-angular:app my-app
```

## Serve Application

```
yarn start
```

## Generate Angular Service

```
nx generate @nrwl/angular:service services/photo --project my-app --dryRun
```

## Shared Libraries

```
// Generate a new Angular library
nx generate @nrwl/angular:library my-lib

// Generate a component in the new library
nx generate @nrwl/angular:component MyComponent --project my-lib
```

## Using Capacitor

Nxtend Ionic applications are generated with Capacitor support by default. However, before we can use Capacitor, we must build our application:

```
nx build my-app
nx run my-app:add:ios
nx run my-app:open:ios

```

## References

https://ionicframework.com/blog/?p=3663
https://nxtend.dev/docs/ionic-angular
