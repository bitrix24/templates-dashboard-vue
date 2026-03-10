<template>
  <!-- Data Chart -->
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
</template>
