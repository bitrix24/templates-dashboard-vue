<template>
  <!-- Main container: fixed screen height, no scrolling -->
  <div class="flex flex-row h-screen  overflow-hidden">
    <!-- Sidebar: visible only on desktop -->
    <aside class="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-(--ui-color-divider-default) bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) p-5">
      <div class="flex items-center gap-3 px-2 mb-8">
        <B24Skeleton accent="accent" class="size-8 rounded-lg" />
        <B24Skeleton accent="default" class="h-5 w-24" />
      </div>
      <B24Skeleton accent="less" class="h-9 w-full rounded-md mb-8" />
      <nav class="space-y-6 flex-1 overflow-hidden">
        <div v-for="group in 2" :key="group" class="space-y-3">
          <B24Skeleton accent="less" class="h-3 w-16 ml-2 opacity-50" />
          <div v-for="item in 3" :key="item" class="flex items-center gap-3 px-2 py-1">
            <B24Skeleton accent="less" class="size-4 rounded-md" />
            <B24Skeleton accent="less" class="h-4 w-28" />
          </div>
        </div>
      </nav>
      <div class="mt-auto pt-4 border-t border-(--ui-color-divider-default) flex items-center gap-3">
        <B24Skeleton accent="accent" class="size-9 rounded-full" />
        <div class="space-y-1.5">
          <B24Skeleton accent="default" class="h-3 w-16" />
          <B24Skeleton accent="less" class="h-2 w-20" />
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col h-full p-4 md:p-6 gap-3 md:gap-5 overflow-hidden">
      <!-- Heather -->
      <header class="flex flex-row justify-between items-center shrink-0">
        <B24Skeleton accent="default" class="h-7 w-28 rounded-sm" />
        <div class="flex gap-2">
          <B24Skeleton accent="less" class="h-8 w-32 rounded-md hidden sm:block" />
          <B24Skeleton accent="less" class="h-8 w-8 rounded-md" />
        </div>
      </header>

      <!-- Stats: grid-cols-1 on mobile (one below the other) -->
      <section class="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
        <!-- Always visible (2 blocks) -->
        <div v-for="i in 2" :key="'v-' + i" class="bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) p-3 md:p-4 rounded-lg border border-(--ui-color-divider-default) shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <B24Skeleton accent="accent" class="size-5 shrink-0 rounded-full" />
            <B24Skeleton accent="less" class="h-3 w-16" />
          </div>
          <div class="flex items-end justify-between">
            <B24Skeleton accent="default" class="h-6 w-20" />
            <B24Skeleton accent="accent" class="h-4 w-10 rounded-xl" />
          </div>
        </div>
        <!-- Visible only on desktop -->
        <div v-for="i in 2" :key="'h-' + i" class="hidden lg:block bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) p-4 rounded-lg border border-(--ui-color-divider-default) shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <B24Skeleton accent="accent" class="size-5 shrink-0 rounded-full" />
            <B24Skeleton accent="less" class="h-3 w-16" />
          </div>
          <div class="flex items-end justify-between">
            <B24Skeleton accent="default" class="h-6 w-20" />
            <B24Skeleton accent="accent" class="h-4 w-10 rounded-xl" />
          </div>
        </div>
      </section>

      <HomeLoaderChart />

      <!-- Sales -->
      <HomeLoaderSales />
    </main>
  </div>
</template>
