import dayjs from "dayjs";
import { getRoleList, delRole } from "@/api/system/role";
import { type PaginationProps } from "@/components/ReTable";
import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";

export interface paramasType {
  pageIndex: number;
  pageSize: number;
  roleName?: string;
  remark?: string;
}

export function useRole() {
  const form = reactive({
    roleName: "",
    remark: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 100
    },
    {
      label: "ID",
      prop: "roleId",
      minWidth: "160px"
    },
    {
      label: "角色名",
      prop: "roleName",
      minWidth: "130px"
    },
    {
      label: "角色描述",
      prop: "remark",
      minWidth: "160px"
    },
    {
      label: "创建时间",
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "最后修改时间",
      prop: "updateTime",
      formatter: ({ updateTime }) =>
        dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      width: 220,
      slot: "operation"
    }
  ];
  const dialogVisible = ref(false);
  const dialogVisible1 = ref(false);
  const dialogTitle = ref("添加角色");
  const editId = ref("");
  const roleId = ref("");

  // 添加
  function showAddRole() {
    editId.value = editId.value === "clickAgain" ? "" : "clickAgain"; //为了解决每次点击添加都能重置addUpdate.vue中的form表单
    dialogVisible.value = true;
    dialogTitle.value = "添加角色";
  }
  // 编辑
  function handleUpdate(row) {
    editId.value =
      editId.value === row.roleId ? row.roleId + "clickAgain" : row.roleId;
    dialogVisible.value = true;
    dialogTitle.value = "编辑角色";
  }
  //删除角色
  function handleDelete(row) {
    const roleId = row.roleId;
    const msg = `确认删除该角色?`;
    ElMessageBox.confirm(msg, `提示`, {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        deleteDo(roleId);
      })
      .catch(() => {
        message("取消操作", {
          type: "info"
        });
      });
  }
  //删除角色接口调用
  function deleteDo(roleId) {
    delRole(roleId).then(res => {
      if (res.success) {
        onSearch();
        message("删除成功", {
          type: "success"
        });
      }
    });
  }
  //分配菜单
  function handleMenu(row) {
    roleId.value = row.roleId;
    dialogVisible1.value = true;
  }

  // 分页数量改变
  function handleSizeChange() {
    onSearch();
  }

  //当前页改变
  function handleCurrentChange() {
    onSearch();
  }

  // 获取列表
  async function onSearch() {
    loading.value = true;
    const paramas: paramasType = {
      pageSize: pagination.pageSize,
      pageIndex: pagination.currentPage
    };
    if (form.roleName) {
      paramas.roleName = form.roleName;
    }
    if (form.remark) {
      paramas.remark = form.remark;
    }
    const data = await getRoleList(paramas);
    dataList.value = data.data.rows;
    pagination.total = data.data.totalNum;
    loading.value = false;
  }

  // 重置搜索
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  return {
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
  };
}
