<script setup lang="ts">
import type { TableColumn, TableRow } from '@bitrix24/b24ui-nuxt'
import type { Column } from '@tanstack/vue-table'
import type { User } from '../types'
import type { Row } from '@tanstack/table-core'
import { useTemplateRef, h, ref, computed, watch, resolveComponent } from 'vue'
import { upperFirst } from 'scule'
import { useFetch } from '@vueuse/core'
import { getPaginationRowModel } from '@tanstack/table-core'
import CustomersConfirmModal from '../components/customers/CustomersConfirmModal.vue'
import { sleepAction } from '../utils'
import CopyIcon from '@bitrix24/b24icons-vue/outline/CopyIcon'
import ContactDetailsIcon from '@bitrix24/b24icons-vue/outline/ContactDetailsIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import TrashcanIcon from '@bitrix24/b24icons-vue/outline/TrashcanIcon'
import MenuIcon from '@bitrix24/b24icons-vue/main/MenuIcon'
import ChevronTopLIcon from '@bitrix24/b24icons-vue/outline/ChevronTopLIcon'
import ChevronDownLIcon from '@bitrix24/b24icons-vue/outline/ChevronDownLIcon'
import SettingIcon from '@bitrix24/b24icons-vue/button/SettingIcon'
import SearchIcon from '@bitrix24/b24icons-vue/outline/SearchIcon'
import CrossLIcon from '@bitrix24/b24icons-vue/outline/CrossLIcon'

const B24Avatar = resolveComponent('B24Avatar')
const B24Button = resolveComponent('B24Button')
const B24Badge = resolveComponent('B24Badge')
const B24DropdownMenu = resolveComponent('B24DropdownMenu')
const B24Checkbox = resolveComponent('B24Checkbox')

const overlay = useOverlay()
const confirm = overlay.create(CustomersConfirmModal)
const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

const { data, isFetching } = useFetch('https://bitrix24.github.io/templates-dashboard/api/customers', { initialData: [] }).json<User[]>()

const processing = ref(false)

function onSelect(_: Event, row: TableRow<User>) {
  row.toggleSelected(!row.getIsSelected())
}

async function rowsActionDelete() {
  const count = table.value?.tableApi?.getFilteredSelectedRowModel().rows.length ?? 0
  const instance = confirm.open({
    title: `Confirm deletion of ${count} customer${count > 1 ? 's' : ''}?`
  })

  if (await instance.result) {
    processing.value = true

    await sleepAction(5000)

    toast.add({
      title: `Customer${count > 1 ? 's' : ''} deleted`,
      description: `The customer${count > 1 ? 's' : ''} has been deleted.`,
      icon: TrashcanIcon,
      color: 'air-primary-success'
    })

    processing.value = false
  }
}

function getRowActions(row: Row<User>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy customer ID',
      icon: CopyIcon,
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Customer ID copied to clipboard',
          icon: CopyIcon,
          color: 'air-primary-success'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View customer details',
      icon: ContactDetailsIcon
    },
    {
      label: 'View customer payments',
      icon: WalletIcon
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete customer',
      icon: TrashcanIcon,
      color: 'air-primary-alert',
      async onSelect() {
        const instance = confirm.open({
          title: `Are you sure you want to delete ${row.original.name.toString()}?`
        })

        if (await instance.result) {
          processing.value = true

          await sleepAction(5000)

          toast.add({
            title: 'Customer deleted',
            description: 'The customer has been deleted.',
            icon: TrashcanIcon,
            color: 'air-primary-success'
          })

          processing.value = false
        }
      }
    }
  ]
}

function getHeader(column: Column<User>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    B24Button,
    {
      'color': 'air-tertiary-no-accent',
      label,
      'size': 'sm',
      'class': 'group -mx-2.5 [--ui-btn-height:20px]',
      'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`,
      'onClick': () => column.toggleSorting(column.getIsSorted() === 'asc')
    },
    {
      trailing: () => isSorted
        ? h((isSorted === 'asc' ? ChevronTopLIcon : ChevronDownLIcon), {
            class: {
              'text-(--ui-btn-color) shrink-0 size-[13px]': true,
              'hidden group-hover:inline-flex': !isSorted
            }
          })
        : h('div', {
            class: {
              'size-[13px]': true
            }
          })
    }
  )
}

const isSomeSelect = computed<boolean>((): boolean => {
  const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel()?.rows
  return !!selectedRows?.length
})

const isLoading = computed(() => {
  return isFetching.value === true || processing.value === true
})

const columns: TableColumn<User>[] = [
  {
    id: 'select',
    meta: {
      class: {
        td: 'text-right'
      },
      style: {
        td: {
          width: '20px'
        }
      }
    },
    header: ({ table }) => h(B24Checkbox, {
      'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'size': 'sm',
      'ariaLabel': 'Select all'
    }),
    enableHiding: false,
    cell: ({ row }) => h(B24Checkbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
      'size': 'sm',
      'aria-label': 'Select row'
    })
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-left'
      },
      style: {
        td: {
          width: '20px',
          padding: '16px 4px 16px 16px'
        }
      }
    },
    enableHiding: false,
    cell: ({ row }) => {
      return h(B24DropdownMenu, {
        'content': {
          align: 'center',
          side: 'right',
          sideOffset: -2
        },
        'arrow': true,
        'items': getRowActions(row),
        'aria-label': 'Actions dropdown',
        'disabled': isLoading.value,
        // @todo move to b24ui
        'b24ui': {
          item: 'pe-4.5',
          itemLeadingIcon: 'transition-none'
        }
      }, () => h(B24Button, {
        'icon': MenuIcon,
        'color': 'air-tertiary-no-accent',
        'size': 'md',
        'aria-label': 'Actions dropdown',
        'b24ui': { baseLine: '[--ui-btn-icon-size:24px]' }
      }))
    }
  },
  {
    accessorKey: 'id',
    header: ({ column }) => getHeader(column, 'ID')
  },
  {
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Name'),
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(B24Avatar, {
          ...row.original.avatar,
          size: 'lg'
        }),
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.name),
          h('p', { class: '' }, `@${row.original.name}`)
        ])
      ])
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => getHeader(column, 'Email')
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ row }) => {
      const color = {
        subscribed: 'air-primary-success' as const,
        unsubscribed: 'air-primary-alert' as const,
        bounced: 'air-primary-warning' as const
      }[row.original.status]

      return h(B24Badge, { class: 'capitalize', color }, () =>
        row.original.status
      )
    }
  }
]

const sorting = ref([
  {
    id: 'id',
    desc: false
  }
])

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const statusColumn = table.value.tableApi.getColumn('status')
  if (!statusColumn) return

  if (newVal === 'all') {
    statusColumn.setFilterValue(undefined)
  } else {
    statusColumn.setFilterValue(newVal)
  }
})

const email = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('email')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('email')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 15
})
</script>

<template>
  <B24DashboardPanel id="customers" :b24ui="{ body: 'scrollbar-transparent' }">
    <template #header>
      <B24DashboardNavbar title="Customers">
        <template #right>
          <B24Button
            size="sm"
            label="Feedback"
          />
        </template>
      </B24DashboardNavbar>
    </template>

    <template #body>
      <div class="shrink-0 flex items-center justify-start border-(--ui-color-divider-default) gap-3 overflow-x-auto min-h-[49px] px-1.5 sm:px-0 scrollbar-thin">
        <CustomersAddModal />
        <B24Select
          v-model="statusFilter"
          :items="[
            { label: 'All', value: 'all' },
            { label: 'Subscribed', value: 'subscribed' },
            { label: 'Unsubscribed', value: 'unsubscribed' },
            { label: 'Bounced', value: 'bounced' }
          ]"
          :b24ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
          placeholder="Filter status"
          class="min-w-[150px]"
        />

        <B24Input
          v-model="email"
          class="min-w-[284px] max-w-[384px]"
          :icon="SearchIcon"
          placeholder="Filter emails..."
        />
      </div>
      <div class="relative base-mode shrink-0">
        <B24Table
          ref="table"
          v-model:sorting="sorting"
          v-model:column-filters="columnFilters"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
          v-model:pagination="pagination"
          loading-color="air-primary"
          loading-animation="swing"
          :loading="isLoading"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          class="shrink-0 bg-(--ui-color-design-outline-bg) rounded-none sm:rounded-t-lg"
          :data="data ?? []"
          :columns="columns"
          @select="onSelect"
        >
          <template #actions-header="{ table: tableInSlot }">
            <B24DropdownMenu
              :items="
                tableInSlot
                  ?.getAllColumns()
                  .filter((column: any) => column.getCanHide())
                  .map((column: any) => ({
                    label: upperFirst(column.id),
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      tableInSlot?.getColumn(column.id)?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    }
                  }))
              "
              :content="{ align: 'start', side: 'bottom' }"
            >
              <B24Button size="sm" color="air-tertiary-no-accent" :icon="SettingIcon" />
            </B24DropdownMenu>
          </template>
        </B24Table>

        <div class="ps-3 py-3 flex flex-col md:flex-row gap-1.5 sm:gap-3 items-start md:items-center justify-start border-t border-(--ui-color-divider-default) bg-(--ui-color-design-outline-bg)">
          <div class="md:w-1/6">
            <div class="sm:ml-3 text-xs text-muted uppercase">
              Selected: <ProseStrong class="text-label">
                {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} /
                {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
              </ProseStrong>
            </div>
          </div>
          <div class="flex-1 flex">
            <B24Pagination
              class="mx-auto"
              size="sm"
              active-color="air-selection"
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
          <div class="md:w-1/6 flex" />
        </div>

        <div
          class="rounded-none sm:rounded-b-lg ps-1.5 relative border-t border-(--ui-color-divider-default) py-3 flex flex-row flex-nowrap gap-1.5 sm:gap-3 items-center justify-between bg-(--ui-color-design-outline-bg)"
          :class="[isSomeSelect ? 'sticky z-1 bottom-0 sm:-bottom-4 bitrix-mobile:bottom-0' : '']"
        >
          <B24Button
            :disabled="!isSomeSelect || isLoading"
            loading-auto
            label="Delete"
            :icon="CrossLIcon"
            :normal-case="false"
            color="air-tertiary-no-accent"
            @click="rowsActionDelete"
          />
        </div>
      </div>
    </template>
  </B24DashboardPanel>
</template>
