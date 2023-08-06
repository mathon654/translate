<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Setting from "@iconify-icons/ep/setting";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import addUpdate from "./addUpdate.vue";
import assignMenu from "./assignMenu.vue";

defineOptions({
  name: "Role"
});

const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleUpdate,
  handleDelete,
  handleMenu,
  handleSizeChange,
  handleCurrentChange,
  showAddRole,
  dialogVisible,
  dialogVisible1,
  dialogTitle,
  editId,
  roleId
} = useRole();
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="w-[99/100] pl-4">
      <el-form-item label="角色名：" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名" />
      </el-form-item>
      <el-form-item label="角色描述：" prop="remark">
        <el-input v-model="form.remark" placeholder="请输入角色描述" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <TableBar @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="showAddRole"
          v-permission="'system:role:add'"
        >
          新增角色
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <ReTable
          border
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="columns"
          :checkList="checkList"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="info"
              :size="size"
              @click="handleUpdate(row)"
              :icon="useRenderIcon(EditPen)"
              v-permission="'system:role:update'"
            >
              <span class="text-xs">修改</span>
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="warning"
              :size="size"
              :icon="useRenderIcon(Setting)"
              @click="handleMenu(row)"
              v-permission="'system:role:authorizeMenu'"
            >
              <span class="text-xs">配置菜单</span>
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="danger"
              :size="size"
              :icon="useRenderIcon(Delete)"
              @click="handleDelete(row)"
              v-permission="'system:role:delete'"
              v-if="row.roleType != '3'"
            >
              <span class="text-xs">删除</span>
            </el-button>
          </template>
        </ReTable>
      </template>
    </TableBar>

    <addUpdate
      :editId="editId"
      v-model:dialogVisible="dialogVisible"
      v-model:dialogTitle="dialogTitle"
      @refreshList="onSearch"
    />
    <assignMenu :roleId="roleId" v-model:dialogVisible1="dialogVisible1" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
