import { Regex } from "@/utils/regexp";
import { reactive } from "vue";
import type { FormRules } from "element-plus";

export const validateAddFunc = form => {
  const validateAdd = reactive<FormRules>({
    account: [
      { required: true, message: "请输入用户名", trigger: "blur" },
      { max: 30, message: "最多30 个字符", trigger: "blur" }
    ],
    password: [
      { required: true, message: "请输入密码", trigger: "blur" },
      { min: 6, max: 18, message: "长度在 6 到 18 个字符", trigger: "blur" }
    ],
    checkPass: [
      { required: true, message: "请输入密码", trigger: "blur" },
      { min: 6, max: 18, message: "长度在 6 到 18 个字符", trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (value === "") {
            callback(new Error("请再次确认密码"));
          } else if (value !== form.password) {
            callback(new Error("两次输入密码不一致!"));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ],
    mobilePhone: [
      { required: true, message: "请输入手机号", trigger: "blur" },
      {
        validator(rule, value, callback) {
          if (Regex.PHONE.test(value)) return callback();
          return callback(new Error("请输入正确格式的手机号"));
        },
        trigger: "blur"
      }
    ],
    locked: [{ required: true, message: "请选择状态", trigger: "blur" }]
  });
  return validateAdd;
};

export const validateEdit = reactive<FormRules>({
  account: [
    { required: true, message: "请输入用户名", trigger: "change" },
    { max: 30, message: "最多30 个字符", trigger: "blur" }
  ],
  mobilePhone: [
    { required: true, message: "请输入手机号", trigger: "change" },
    {
      validator(rule, value, callback) {
        if (Regex.PHONE.test(value)) return callback();
        return callback(new Error("请输入正确格式的手机号"));
      },
      trigger: "blur"
    }
  ],
  locked: [{ required: true, message: "请选择状态", trigger: "blur" }]
});
