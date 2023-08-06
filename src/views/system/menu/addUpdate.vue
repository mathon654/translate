<script setup lang="ts">
import IconSelect from "@/components/IconSelect/index.vue";
import { ClickOutside as vClickOutside } from "element-plus";
import { reactive, ref, watch, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { getMenuList, updateMenu, addMenu } from "@/api/system/menu";
import { message } from "@/utils/message";
import treeSort from "@/utils/treeSort";

//form表单类型
export type formType = {
  menuId?: string; //菜单编号
  parentId?: string; //上级菜单编号
  menuLevel?: string; //菜单级别(0:树枝节点;1:叶子节点;2:按钮级别)
  request?: string; //请求地址(最长200)
  menuCode?: string; //权限字符,用于控制页面、菜单、按钮的显示隐藏
  menuName?: string; //菜单名称(最长50)

  icon?: string; //节点图标
  sortNo?: number; // 排序号
  remark?: string; //备注
  componentName?: string; //页面name，用于系统跳转，必须

  menuType?: number; //菜单类型(0:业务菜单;1:系统菜单;)
  menuSource?: number; //菜单来源(1:系统初始化菜单（不可修改）;2:动态增加)
  iconCls?: string; //节点图标CSS类名
};

//props类型
export interface Props {
  dialogForm?: formType;
  editId?: string;
  dialogVisible?: boolean;
  dialogTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  dialogForm: () => {
    return {};
  },
  editId: "",
  dialogVisible: false,
  dialogTitle: "添加菜单"
});

const emits = defineEmits(["update:dialogVisible", "refreshList"]);

onMounted(() => {
  getTreeselect();
  form.value = props.dialogForm;
});
//通过监听editId来处理不同操作时，tree数据，与表单数据的变化
watch(
  () => props.editId,
  newVal => {
    if (newVal) {
      if (newVal.includes("clickAgain")) {
        newVal = newVal.replace("clickAgain", "");
      }
      if (newVal) {
        if (props.dialogForm) {
          form.value = props.dialogForm;
        }
      } else if (formRef?.value) {
        formRef.value.resetFields();
      }
    } else if (formRef?.value) {
      formRef.value.resetFields();
    }
  }
);
const menuOptions = ref([]);
const iconSelectRef = ref(null);
const showChooseIcon = ref(false);
const btnLoading = ref(false);
const formRef = ref<FormInstance>(null);

const form = ref<formType>({});
const rules = reactive<FormRules>({
  parentId: [{ required: true, message: "上级菜单不能为空", trigger: "blur" }],
  menuLevel: [{ required: true, message: "菜单类型不能为空", trigger: "blur" }],
  menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
  sortNo: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
  menuCode: [
    { required: true, message: "页面路径或权限标识不能为空", trigger: "blur" }
  ],
  componentName: [
    { required: true, message: "页面名称不能为空", trigger: "blur" }
  ]
});

/** 查询并组装菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = [];
  getMenuList().then(res => {
    const format = {
      id: "menuId",
      root: "root",
      pid: "parentId",
      child: "children",
      sort: { field: "sortNo", direct: 1 }
    };
    const menuList = treeSort.format(res.data, format);

    const menu = { menuId: "0", menuName: "主类目", children: [] };
    menu.children = menuList;
    menuOptions.value.push(menu);
  });
}

/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
}
/** 选择图标 */
function selected(name) {
  form.value.icon = name;
  showChooseIcon.value = false;
}
/** 图标外层点击隐藏下拉列表 */
function hideSelectIcon(event) {
  const elem =
    event.relatedTarget ||
    event.srcElement ||
    event.target ||
    event.currentTarget;
  const className = elem.className;
  if (className !== "el-input__inner") {
    showChooseIcon.value = false;
  }
}

/** 取消按钮 */
function cancel() {
  emits("update:dialogVisible");
}

function submitForm() {
  btnLoading.value = true;
  formRef.value.validate(valid => {
    if (valid) {
      //将parentId === '0' 替换为 parentId === 'root'，后端接口规定
      if (form.value.parentId === "0") {
        form.value.parentId = "root";
      }
      submitHandle();
    } else {
      btnLoading.value = false;
      return false;
    }
  });
}

function submitHandle() {
  const paramas = { ...form.value };
  //不同菜单类型提交有不同必传参数，删除不必要参数
  if (paramas.menuLevel === "2") {
    delete paramas.componentName;
    delete paramas.icon;
    delete paramas.iconCls;
  }
  if (paramas.menuId) {
    updateMenu(paramas)
      .then(res => {
        btnLoading.value = false;
        if (res.success) {
          message("修改成功", { type: "success" });
          cancel();
          emits("refreshList");
          getTreeselect();
        }
      })
      .catch(() => {
        btnLoading.value = false;
      });
  } else {
    addMenu(paramas)
      .then(res => {
        btnLoading.value = false;
        if (res.success) {
          message("新增成功", { type: "success" });
          cancel();
          emits("refreshList");
          getTreeselect();
        }
      })
      .catch(() => {
        btnLoading.value = false;
      });
  }
}
</script>
<template>
  <div>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      :modelValue="props.dialogVisible"
      :title="props.dialogTitle"
      align-center
      width="680px"
      append-to-body
      @close="cancel"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                style="width: 100%"
                v-model="form.parentId"
                :data="menuOptions"
                :props="{
                  value: 'menuId',
                  label: 'menuName',
                  children: 'children'
                }"
                value-key="menuId"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuLevel">
              <el-radio-group v-model="form.menuLevel">
                <el-radio label="0">目录</el-radio>
                <el-radio label="1">菜单</el-radio>
                <el-radio label="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuLevel !== '2'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                placement="bottom-start"
                :width="540"
                v-model:visible="showChooseIcon"
                trigger="click"
                @show="showSelectIcon"
              >
                <template #reference>
                  <el-input
                    v-model="form.icon"
                    placeholder="点击选择图标"
                    v-click-outside="hideSelectIcon"
                    readonly
                  >
                    <template #prefix>
                      <svg-icon
                        v-if="form.icon"
                        :icon-class="form.icon"
                        class="el-input__icon"
                        style="height: 32px; width: 16px"
                      />
                      <el-icon v-else style="height: 32px; width: 16px"
                        ><search
                      /></el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select
                  ref="iconSelectRef"
                  @selected="selected"
                  :active-icon="form.icon"
                />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="
                form.menuLevel === '0'
                  ? '目录名称'
                  : form.menuLevel === '1'
                  ? '菜单名称'
                  : '按钮名称'
              "
              prop="menuName"
            >
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuLevel !== '2'">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.sortNo"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="menuCode">
              <el-input
                v-model="form.menuCode"
                :placeholder="
                  form.menuLevel === '2' ? '请输入权限标识' : '请输入页面路径'
                "
                maxlength="100"
              />
              <template #label>
                <span>
                  <el-tooltip
                    content="按钮控制器中定义的权限字符，如：v-permission='system:role:add'"
                    placement="top"
                    v-if="form.menuLevel === '2'"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  <el-tooltip
                    content="访问的页面路径，如：菜单管理 `/system/menu/index`，默认在`views`目录下"
                    placement="top"
                    v-else-if="form.menuLevel === '1'"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  <el-tooltip
                    content="访问的目录路径，如：菜单管理 `/system`，默认在`views`目录下"
                    placement="top"
                    v-else
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  {{
                    form.menuLevel === "0"
                      ? "目录路径"
                      : form.menuLevel === "1"
                      ? "页面路径"
                      : "权限标识"
                  }}
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuLevel === '1'">
            <el-form-item prop="componentName">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问页面的名称，系统访问页面路由时，根据页面名称来定位"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  页面名称
                </span>
              </template>
              <el-input
                v-model="form.componentName"
                placeholder="请输入页面名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuLevel === '2'">
            <el-form-item prop="request">
              <template #label>
                <span>
                  <el-tooltip
                    content="此按钮功能对应的后端接口请求地址，如：新增菜单接口：/boss/system/menu/add"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  接口地址
                </span>
              </template>
              <el-input v-model="form.request" placeholder="接口请求地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              maxlength="50"
              type="textarea"
              placeholder="请输入菜单备注"
              v-model.trim="form.remark"
            />
          </el-form-item>
        </el-col>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" :loading="btnLoading"
            >确 定</el-button
          >
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
