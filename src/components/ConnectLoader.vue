<template>
  <!-- @todo fix bg -->
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

      <!-- Stats blocks: grid-cols-1 on mobile (one below the other) -->
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

      <!-- Data graph -->
      <section class="flex-1 min-h-0 bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) p-4 md:p-5 rounded-lg border border-(--ui-color-divider-default) flex flex-col shadow-sm relative">
        <div class="mb-3 shrink-0 space-y-2 relative z-10">
          <B24Skeleton accent="less" class="h-3 w-12" />
          <B24Skeleton accent="default" class="h-5 w-24" />
        </div>
        <div class="flex-1 w-full relative overflow-hidden flex items-end">
          <!-- Grid -->
          <div class="absolute inset-0 flex flex-col justify-between opacity-5">
            <div v-for="l in 3" :key="l" class="w-full border-t border-gray-400" />
          </div>
          <!-- Graph line -->
          <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
            <path d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,40 V100 H0 Z" class="fill-blue-500/5 dark:fill-blue-400/5" />
            <path
              d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,40"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="text-blue-400/20 dark:text-blue-500/20"
            />
          </svg>
          <div class="w-full flex justify-between pt-2 relative z-10">
            <B24Skeleton
              v-for="d in 5"
              :key="d"
              accent="less"
              class="h-1.5 w-6 opacity-30"
            />
          </div>
        </div>
      </section>

      <!-- Table -->
      <section class="flex-1 min-h-0 bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) rounded-lg border border-(--ui-color-divider-default) flex flex-col shadow-sm overflow-hidden">
        <div class="p-3 border-b border-(--ui-color-divider-default) flex justify-between shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
          <B24Skeleton accent="less" class="h-3 w-8" />
          <B24Skeleton accent="less" class="h-3 w-20" />
          <B24Skeleton accent="less" class="h-3 w-10" />
        </div>
        <div class="flex-1 overflow-hidden">
          <div v-for="row in 5" :key="row" class="p-3 flex justify-between items-center border-b border-(--ui-color-divider-default) last:border-0 gap-4">
            <B24Skeleton accent="default" class="h-3 w-8" />
            <B24Skeleton accent="less" class="h-3 w-20" />
            <B24Skeleton accent="default" class="h-3 w-12" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
