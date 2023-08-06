<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
const { device } = useNav();
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import countryList from "@/utils/countryList";
import {
  PersonnelInfo,
  addPersonnel,
  updatePersonnel,
  getPersonnelInfo
} from "@/api/system/personnel";
import { message } from "@/utils/message";
import { validateEdit, validateAddFunc } from "./validate";

const props = defineProps({
  editId: { type: String, default: "" },
  dialogVisible: { type: Boolean, default: false },
  dialogTitle: { type: String, default: "新增人员" }
});
const emits = defineEmits(["update:dialogVisible", "refreshList"]);

watch(
  () => props.editId,
  newVal => {
    if (newVal) {
      if (newVal.includes("clickAgain")) {
        newVal = newVal.replace("clickAgain", "");
      }
      if (newVal) {
        rules = validateEdit;
        getPersonnelInfo(newVal).then(res => {
          form.value = res.data;
        });
      } else if (formRef?.value) {
        rules = validateAddFunc(form.value);
        formRef.value.resetFields();
      }
    } else if (formRef?.value) {
      rules = validateAddFunc(form.value);
      formRef.value.resetFields();
    }
  }
);

const form = ref<PersonnelInfo>({
  userName: "", //修改时使用
  account: "", //展示时使用
  password: "",
  mobileArea: "855",
  mobilePhone: "",
  checkPass: "",
  locked: "0",
  remark: "",
  sex: "0",
  userType: "1"
});
const formRef = ref<FormInstance>(null);
let rules = reactive<FormRules>(validateAddFunc(form.value));
const btnloading = ref(false);

function closeDialog() {
  emits("update:dialogVisible");
}

function submitForm() {
  btnloading.value = true;
  formRef.value.validate(valid => {
    console.log(valid);
    if (valid) {
      submitHandle();
    } else {
      btnloading.value = false;
      return false;
    }
  });
}

function submitHandle() {
  let editId = props.editId;
  if (editId.includes("clickAgain")) {
    editId = editId.replace("clickAgain", "");
  }
  form.value.userName = form.value.account;
  if (editId) {
    updatePersonnel(form.value)
      .then(res => {
        if (res.success) {
          message("修改成功！", { type: "success" });
          closeDialog();
          emits("refreshList");
        }
        btnloading.value = false;
      })
      .catch(() => {
        btnloading.value = false;
      });
  } else {
    addPersonnel(form.value)
      .then(res => {
        if (res.success) {
          message("添加成功！", { type: "success" });
          closeDialog();
          formRef.value.resetFields();
          emits("refreshList");
        }
        btnloading.value = false;
      })
      .catch(() => {
        btnloading.value = false;
      });
  }
}
</script>
<template>
  <div>
    <el-dialog
      :modelValue="props.dialogVisible"
      :title="props.dialogTitle"
      @close="closeDialog"
      align-center
      :width="device === 'mobile' ? '95vw' : 500"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
        label-width="120px"
        status-icon
      >
        <el-form-item label="用户名" prop="account">
          <el-input
            :disabled="editId && editId !== 'clickAgain' ? true : false"
            autocomplete="off"
            placeholder="请输入用户名"
            type="text"
            v-model.trim="form.account"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
          v-if="!editId || editId === 'clickAgain'"
        >
          <el-input
            autocomplete="off"
            placeholder="请输入密码"
            type="password"
            v-model.trim="form.password"
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="checkPass"
          v-if="!editId || editId === 'clickAgain'"
        >
          <el-input
            autocomplete="off"
            placeholder="请确认密码"
            type="password"
            v-model.trim="form.checkPass"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="mobilePhone">
          <el-input
            type="text"
            placeholder="请输入手机号"
            v-model.trim="form.mobilePhone"
            autocomplete="off"
          >
            <template #prepend>
              <el-select
                :style="{ width: device === 'mobile' ? '100px' : '160px' }"
                filterable
                v-model="form.mobileArea"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in countryList"
                  :key="item.name"
                  :label="
                    ('+' + item.mobileArea + ' ' + item.name).length > 12
                      ? ('+' + item.mobileArea + ' ' + item.name).substring(
                          0,
                          12
                        ) + '...'
                      : '+' + item.mobileArea + ' ' + item.name
                  "
                  :value="item.mobileArea"
                />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="locked">
          <el-radio label="0" v-model="form.locked">可用</el-radio>
          <el-radio label="1" v-model="form.locked">不可用</el-radio>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input maxlength="50" type="textarea" v-model.trim="form.remark" />
        </el-form-item>
      </el-form>

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
