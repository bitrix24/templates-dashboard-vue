<template>
  <!-- Sales -->
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
</template>
