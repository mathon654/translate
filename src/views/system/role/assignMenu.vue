<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
const { device } = useNav();
import { ref, watch } from "vue";
import type { FormInstance, ElTree } from "element-plus";
import { getRoleMenu, authorizeMenu } from "@/api/system/role";
import { getMenuList } from "@/api/system/menu";
import { message } from "@/utils/message";
import treeSort from "@/utils/treeSort";

const props = defineProps({
  roleId: String,
  dialogVisible1: { type: Boolean, default: false }
});
const emits = defineEmits(["update:dialogVisible1"]);

watch(
  () => props.roleId,
  newVal => {
    if (newVal) {
      getAllMenuFuc();
    }
  }
);

const formRef = ref<FormInstance>(null);
const treeRef = ref<InstanceType<typeof ElTree>>(null);
const btnloading = ref(false);
const form = ref({
  roleName: "",
  remark: ""
});
const menuData = ref([]);
const menuIds = ref([]);
const emptyText = ref("加载中...");
const defaultProps = ref({
  children: "children",
  label: "menuName"
});

function closeDialog() {
  emits("update:dialogVisible1");
}

const getAllMenuFuc = async () => {
  // 获取菜单列表
  const childIds = await getAllMenu();
  //获取用户对应的角色信息
  getRoleMenu(props.roleId).then(res => {
    // 筛选出非父级
    menuIds.value = res.data.menus.map(v => {
      if (v.parentId !== "root" && !childIds.includes(v.menuId))
        return v.menuId;
    });
    //需要手动设置选中的key数组，因为default-checked-keys属性只适用于el-tree挂载时默认值的设置
    if (treeRef.value) {
      treeRef.value?.setCheckedKeys(menuIds.value);
    }
    form.value = res.data;
  });
};
function getAllMenu() {
  return getMenuList().then(
    res => {
      const format = {
        id: "menuId",
        root: "root",
        pid: "parentId",
        child: "children",
        sort: { field: "sortNo", direct: 1 }
      };
      menuData.value = treeSort.format(res.data, format);
      if (menuData.value.length === 0) {
        emptyText.value = "暂无数据";
      }

      // 拿到除root级别外具有子级级别的菜单id集合
      function getChildIds(data) {
        let temArr = data.map(item => {
          if (item.children && item.children.length > 0) {
            return item.menuId;
          }
        });
        temArr = temArr.filter(res => res !== undefined);
        return temArr;
      }
      const childIds = menuData.value.reduce((prev, cur) => {
        return prev.concat(getChildIds(cur.children));
      }, []);
      return childIds;
    },
    () => {
      emptyText.value = "加载失败";
    }
  );
}
//提交
function submitForm() {
  btnloading.value = true;
  const menuIds = treeRef.value.getCheckedNodes(false, true).map(v => {
    return v.menuId;
  });
  authorizeMenu({ menuIds, roleId: props.roleId })
    .then(res => {
      if (res.success) {
        message("操作成功！", { type: "success" });
        closeDialog();
      }
      btnloading.value = false;
    })
    .catch(() => {
      btnloading.value = false;
    });
}
</script>
<template>
  <div>
    <el-dialog
      :modelValue="props.dialogVisible1"
      title="分配角色"
      @close="closeDialog"
      align-center
      :width="device === 'mobile' ? '95vw' : 700"
    >
      <el-scrollbar height="500px">
        <el-form ref="formRef" :model="form" label-width="120px" status-icon>
          <el-form-item label="用户名" prop="roleName">
            <el-input type="text" disabled v-model.trim="form.roleName" />
          </el-form-item>
          <el-form-item label="角色描述" prop="remark">
            <el-input type="textarea" v-model.trim="form.remark" />
          </el-form-item>
          <el-form-item label="菜单">
            <div class="w-full">
              <el-tree
                :data="menuData"
                show-checkbox
                :empty-text="emptyText"
                node-key="menuId"
                ref="treeRef"
                :default-expand-all="true"
                :check-on-click-node="true"
                :props="defaultProps"
              />
            </div>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog" class="mr-5">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="btnloading">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
