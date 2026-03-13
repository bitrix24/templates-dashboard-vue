<script setup lang="ts">
import type { TableColumn } from '@bitrix24/b24ui-nuxt'
import type { User } from '../types'
import { useTemplateRef, h, ref, computed, watch, resolveComponent } from 'vue'
import { upperFirst } from 'scule'
import { useFetch } from '@vueuse/core'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import CopyIcon from '@bitrix24/b24icons-vue/outline/CopyIcon'
import ContactDetailsIcon from '@bitrix24/b24icons-vue/outline/ContactDetailsIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import TrashcanIcon from '@bitrix24/b24icons-vue/outline/TrashcanIcon'
import MenuIcon from '@bitrix24/b24icons-vue/main/MenuIcon'
import SortIcon from '@bitrix24/b24icons-vue/actions/SortIcon'
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

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({ 3: true })

const { data, isFetching } = useFetch('https://dashboard-template.nuxt.dev/api/customers', { initialData: [] }).json<User[]>()

function getRowItems(row: Row<User>) {
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
      onSelect() {
        toast.add({
          title: 'Customer deleted',
          description: 'The customer has been deleted.',
          icon: TrashcanIcon,
          color: 'air-primary-success'
        })
      }
    }
  ]
}

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
          'items': getRowItems(row),
          'aria-label': 'Actions dropdown'
        }, () => h(B24Button, {
        'icon': MenuIcon,
        'color': 'air-tertiary-no-accent',
        'size': 'sm',
        'aria-label': 'Actions dropdown'
      }))
    }
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Name',
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
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(B24Button, {
        color: 'air-tertiary-no-accent',
        label: 'Email',
        size: 'sm',
        class: '-mx-2.5 [--ui-btn-height:20px]',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }, {
        trailing: () => h(isSorted ? (isSorted === 'asc' ? ChevronTopLIcon : ChevronDownLIcon) : SortIcon, {
          class: 'text-(--ui-btn-color) shrink-0 size-(--ui-btn-icon-size)'
        })
      })
    }
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
  pageSize: 10
})
</script>

<template>
  <B24DashboardPanel id="customers" :b24ui="{ body: 'p-4' }">
    <template #header>
      <B24DashboardNavbar title="Customers">
        <template #trailing>
          <div class="ml-4 flex flex-wrap items-center justify-start gap-1.5">
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
              class="max-w-[384px]"
              :icon="SearchIcon"
              placeholder="Filter emails..."
            />
          </div>
        </template>
      </B24DashboardNavbar>
    </template>

    <template #body>
      <div class="relative rounded-lg border border-(--ui-color-divider-default) overflow-hidden">
        <B24Table
          ref="table"
          v-model:column-filters="columnFilters"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
          v-model:pagination="pagination"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          sticky
          class="shrink-0 h-[calc(100dvh-50px-106px-67px-32px)] sm:h-[calc(100dvh-50px-61px-67px-32px)]"
          :data="data ?? []"
          :columns="columns"
          :loading="isFetching"
          :b24ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-tl-lg last:rounded-tr-lg border-b border-(--ui-color-divider-default)',
            td: 'border-b border-(--ui-color-divider-default)',
            separator: 'h-0'
          }"
        >
          <template #actions-header="{ table }">
            <B24DropdownMenu
              :items="
                table
                  ?.getAllColumns()
                  .filter((column: any) => column.getCanHide())
                  .map((column: any) => ({
                    label: upperFirst(column.id),
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.getColumn(column.id)?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    }
                  }))
              "
              arrow
              :content="{ align: 'center' }"
            >
              <B24Button size="sm" color="air-tertiary-no-accent" :icon="SettingIcon" />
            </B24DropdownMenu>
          </template>
        </B24Table>

        <div class="flex flex-col md:flex-row gap-3 items-center justify-start border-t border-(--ui-color-divider-default) py-4">
          <div class="md:w-1/6 text-xs text-muted uppercase ml-3">
            Selected: <ProseStrong class="text-label">
              {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} /
              {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
            </ProseStrong>
          </div>

          <div class="flex-1 flex">
            <B24Pagination
              class="mx-auto"
              size="sm"
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>

          <div class="md:w-1/6 lex"></div>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-(--ui-color-divider-default) py-4">
          <CustomersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <B24Button
              :disabled="table?.tableApi?.getFilteredSelectedRowModel().rows.length < 1"
              label="Delete"
              :icon="CrossLIcon"
              :normal-case="false"
              color="air-tertiary-no-accent"
            />
          </CustomersDeleteModal>
        </div>
      </div>
    </template>
  </B24DashboardPanel>
</template>
