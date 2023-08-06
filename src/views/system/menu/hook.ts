import { ref, nextTick, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import treeSort from "@/utils/treeSort";
import { getMenuList, delMenu } from "@/api/system/menu";
import { formType } from "./addUpdate.vue";

export function useMenu() {
  const menuList = ref([]);
  const loading = ref(true);
  const isExpandAll = ref(true);
  const refreshTable = ref(true);

  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const dialogForm = ref<formType>({
    menuId: "", //菜单编号
    parentId: "0", //上级菜单编号
    menuLevel: "0", //菜单级别(0:树枝节点;1:叶子节点;2:按钮级别)
    icon: "", //节点图标
    menuName: "", //菜单名称(最长50)
    sortNo: 1, // 排序号
    remark: "", //备注
    menuCode: "", //页面路径，对应框架页面
    request: "", //后端请求路径，不可修改
    componentName: "", //页面name，用于系统跳转，必须

    menuType: 0, //菜单类型(0:业务菜单;1:系统菜单;)
    menuSource: 2, //菜单来源(1:系统初始化菜单（不可修改）;2:动态增加)
    iconCls: "" //节点图标CSS类名
  });
  const editId = ref("");

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "menuName",
      showOverflowTooltip: true,
      width: "250"
    },
    {
      label: "图标",
      slot: "icon",
      width: "100"
    },
    {
      label: "排序",
      prop: "sortNo",
      width: "100"
    },
    {
      label: "备注",
      prop: "remark",
      showOverflowTooltip: true,
      width: "150"
    },
    {
      label: "页面路径或权限标识",
      prop: "menuCode",
      showOverflowTooltip: true,
      minWidth: 240
    },
    {
      label: "接口地址",
      prop: "request",
      showOverflowTooltip: true,
      minWidth: 240
    },
    // {
    //   label: "后端请求路径",
    //   prop: "request",
    //   showOverflowTooltip: true,
    //   minWidth: "300"
    // },
    {
      label: "操作",
      width: 220,
      slot: "operation"
    }
  ];

  /** 查询菜单列表 */
  function getList() {
    loading.value = true;
    getMenuList().then(res => {
      const format = {
        id: "menuId",
        root: "root",
        pid: "parentId",
        child: "children",
        sort: { field: "sortNo", direct: 1 }
      };
      menuList.value = treeSort.format(res.data, format);
      loading.value = false;
    });
  }

  /** 展开/折叠操作 */
  function toggleExpandAll() {
    refreshTable.value = false;
    isExpandAll.value = !isExpandAll.value;
    nextTick(() => {
      refreshTable.value = true;
    });
  }

  /** 表单重置 */
  function reset() {
    dialogForm.value = {
      menuId: "", //菜单编号
      parentId: "0", //上级菜单编号
      menuLevel: "0", //菜单级别(0:树枝节点;1:叶子节点;2:按钮级别)
      icon: "", //节点图标
      menuName: "", //菜单名称(最长50)
      sortNo: 1, // 排序号

      remark: "", //备注
      menuCode: "", //页面路径，对应框架页面
      request: "", //后端请求路径，不可修改
      componentName: "", //页面name，用于系统跳转，必须

      menuType: 0, //菜单类型(0:业务菜单;1:系统菜单;)
      menuSource: 2, //菜单来源(1:系统初始化菜单（不可修改）;2:动态增加)
      iconCls: "" //节点图标CSS类名
    };
  }
  /** 新增按钮操作 */
  function handleAdd(row) {
    reset();
    //如果是目录、菜单下新增，修改dialogForm的值并传递到新增页面
    if (row != null && row.menuId) {
      dialogForm.value.parentId = row.menuId;
      dialogForm.value.menuLevel = String(Number(row.menuLevel) + 1);
    }
    editId.value = editId.value === "clickAgain" ? "" : "clickAgain";
    dialogVisible.value = true;
    dialogTitle.value = "添加菜单";
  }
  /** 修改按钮操作 */
  async function handleUpdate(row) {
    editId.value =
      editId.value === row.menuId ? row.menuId + "clickAgain" : row.menuId;
    dialogForm.value = row;
    if (dialogForm.value.parentId === "root") {
      dialogForm.value.parentId = "0";
    }
    dialogVisible.value = true;
    dialogTitle.value = "修改菜单";
  }
  /** 删除按钮操作 */
  function handleDelete(row) {
    ElMessageBox.confirm(
      '是否确认删除名称为"' + row.menuName + '"的数据项?',
      "提示",
      {
        type: "warning"
      }
    )
      .then(function () {
        deleteDo(row.menuId);
      })
      .catch(() => {
        message("取消操作", {
          type: "info"
        });
      });
  }
  //删除人员接口调用
  function deleteDo(menuId) {
    delMenu(menuId).then(res => {
      if (res.success) {
        getList();
        message("删除成功", {
          type: "success"
        });
      }
    });
  }

  onMounted(() => {
    getList();
  });
  return {
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
  };
}
