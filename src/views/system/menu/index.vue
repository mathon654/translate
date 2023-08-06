<script setup lang="ts">
import SvgIcon from "@/components/SvgIcon/index.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import addUpdate from "./addUpdate.vue";
import { useMenu } from "./hook";

import plusIcon from "@iconify-icons/ep/plus";
import sortIcon from "@iconify-icons/ep/sort";

defineOptions({
  name: "Role"
});

const {
  toggleExpandAll,
  handleUpdate,
  handleAdd,
  handleDelete,
  getList,
  loading,
  menuList,
  columns,
  isExpandAll,
  refreshTable,
  dialogVisible,
  dialogTitle,
  dialogForm,
  editId
} = useMenu();
</script>

<template>
  <div class="app-container">
    <TableBar @refresh="getList">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(plusIcon)"
          @click="handleAdd"
          >新增菜单</el-button
        >
        <el-button
          type="info"
          plain
          :icon="useRenderIcon(sortIcon)"
          @click="toggleExpandAll"
          >展开/折叠</el-button
        >
      </template>
      <template v-slot="{ size }">
        <ReTable
          v-if="refreshTable"
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="menuList"
          :columns="columns"
          row-key="menuId"
          :default-expand-all="isExpandAll"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :header-cell-style="{
            backgroundColor: '#f8f8f9',
            borderBottom: '1px solid #dfe6ec',
            color: '#515a6e'
          }"
        >
          <template #icon="{ row }">
            <svg-icon :icon-class="row.icon ? row.icon : ''" />
          </template>
          <template #operation="{ row }">
            <el-button link type="info" icon="Edit" @click="handleUpdate(row)"
              >修改</el-button
            >
            <el-button
              link
              type="primary"
              icon="Plus"
              @click="handleAdd(row)"
              v-if="row.menuLevel !== '2'"
              >新增</el-button
            >
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </ReTable>
      </template>
    </TableBar>
    <addUpdate
      :dialogForm="dialogForm"
      :editId="editId"
      v-model:dialogVisible="dialogVisible"
      v-model:dialogTitle="dialogTitle"
      @refreshList="getList"
    />
  </div>
</template>
