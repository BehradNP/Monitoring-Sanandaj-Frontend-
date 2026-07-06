function v1(path: string) {
  return `/v1/${path.replace(/^\/+/, "")}`;
}

export const API_ENDPOINTS: Record<string, any> = {
  user: {
    getToken: v1("User/GetToken"),
    userProfile: v1("User/UserProfile"),
    profile: v1("User/Profile"),
    list: v1("User/List"),
    create: v1("User/Create"),
    edit: v1("User/Edit"),
    delete: v1("User/Delete"),
  },

  User: {
    GetToken: v1("User/GetToken"),
    UserProfile: v1("User/UserProfile"),
    Profile: v1("User/Profile"),
    List: v1("User/List"),
    Create: v1("User/Create"),
    Edit: v1("User/Edit"),
    Delete: v1("User/Delete"),
  },

  city: {
    list: v1("City/List"),
    get: v1("City/Get"),
    create: v1("City/Create"),
    edit: v1("City/Edit"),
    delete: v1("City/Delete"),
  },

  City: {
    List: v1("City/List"),
    Get: v1("City/Get"),
    Create: v1("City/Create"),
    Edit: v1("City/Edit"),
    Delete: v1("City/Delete"),
  },

  province: {
    list: v1("Province/List"),
    get: v1("Province/Get"),
    create: v1("Province/Create"),
    edit: v1("Province/Edit"),
    delete: v1("Province/Delete"),
  },

  Province: {
    List: v1("Province/List"),
    Get: v1("Province/Get"),
    Create: v1("Province/Create"),
    Edit: v1("Province/Edit"),
    Delete: v1("Province/Delete"),
  },

  ipNetwork: {
    reportAll: v1("IPNetwork/ReportAll"),
    listPersonalIPNetworkDetails: v1("IPNetwork/ListPersonalIPNetworkDetails"),
    listPersonal: v1("IPNetwork/ListPersonal"),
    list: v1("IPNetwork/List"),
    list1: v1("IPNetwork/List1"),
    list2: v1("IPNetwork/List2"),
    info: v1("IPNetwork/Info"),
    listInfosOfAll: v1("IPNetwork/ListInfosoftAll"),
    infos: v1("IPNetwork/Infos"),
    infoSoftware: v1("IPNetwork/InfoSoftware"),
    listInfo: v1("IPNetwork/ListInfo"),
    listInfoMotherboard: v1("IPNetwork/ListInfomotherboard"),
    listInfoCpu: v1("IPNetwork/ListInfocpu"),
    listInfoHdd: v1("IPNetwork/ListInfohdd"),
    listInfoVag: v1("IPNetwork/ListInfovag"),
    listInfoRam: v1("IPNetwork/ListInforam"),
    getCategory: v1("IPNetwork/GetCategory"),
    getCategoryChild: v1("IPNetwork/GetCategoryChild"),
    getCategoryParent: v1("IPNetwork/GetCategoryParent"),
    getTagChild: v1("IPNetwork/GetTagChild"),
    getTagChildTitle: v1("IPNetwork/GetTagChildTitle"),
    editPersonal: v1("IPNetwork/editPersonal"),
    personalIPNetworkDetails: v1("IPNetwork/PersonalIPNetworkDetails"),
    editPersonalIPNetworkDetails: v1("IPNetwork/editPersonalIPNetworkDetails"),
    get: v1("IPNetwork/Get"),
    create: v1("IPNetwork/Create"),
  },

  IPNetwork: {
    ReportAll: v1("IPNetwork/ReportAll"),
    ListPersonalIPNetworkDetails: v1("IPNetwork/ListPersonalIPNetworkDetails"),
    ListPersonal: v1("IPNetwork/ListPersonal"),
    List: v1("IPNetwork/List"),
    List1: v1("IPNetwork/List1"),
    List2: v1("IPNetwork/List2"),
    Info: v1("IPNetwork/Info"),
    ListInfosoftAll: v1("IPNetwork/ListInfosoftAll"),
    Infos: v1("IPNetwork/Infos"),
    InfoSoftware: v1("IPNetwork/InfoSoftware"),
    ListInfo: v1("IPNetwork/ListInfo"),
    GetCategory: v1("IPNetwork/GetCategory"),
    GetCategoryChild: v1("IPNetwork/GetCategoryChild"),
    GetCategoryParent: v1("IPNetwork/GetCategoryParent"),
    GetTagChild: v1("IPNetwork/GetTagChild"),
    GetTagChildTitle: v1("IPNetwork/GetTagChildTitle"),
    EditPersonal: v1("IPNetwork/editPersonal"),
    PersonalIPNetworkDetails: v1("IPNetwork/PersonalIPNetworkDetails"),
    EditPersonalIPNetworkDetails: v1("IPNetwork/editPersonalIPNetworkDetails"),
    Get: v1("IPNetwork/Get"),
    Create: v1("IPNetwork/Create"),
  },

  cupServer: {
    info: v1("CupServer/Info"),
    infoHome: v1("CupServer/InfoHome"),
    getInfo: v1("CupServer/GetInfo"),
    getInfoById: v1("CupServer/GetInfobyid"),
    getInfoByIdHome: v1("CupServer/GetInfobyidHome"),
    list: v1("CupServer/List"),
    get: v1("CupServer/Get"),
    create: v1("CupServer/Create"),
    edit: v1("CupServer/Edit"),
    delete: v1("CupServer/Delete"),
  },

  CupServer: {
    Info: v1("CupServer/Info"),
    InfoHome: v1("CupServer/InfoHome"),
    GetInfo: v1("CupServer/GetInfo"),
    GetInfobyid: v1("CupServer/GetInfobyid"),
    GetInfobyidHome: v1("CupServer/GetInfobyidHome"),
    List: v1("CupServer/List"),
    Get: v1("CupServer/Get"),
    Create: v1("CupServer/Create"),
    Edit: v1("CupServer/Edit"),
    Delete: v1("CupServer/Delete"),
  },

  server: {
    info: v1("CupServer/Info"),
    infoHome: v1("CupServer/InfoHome"),
    list: v1("CupServer/List"),
    get: v1("CupServer/Get"),
    create: v1("CupServer/Create"),
    edit: v1("CupServer/Edit"),
    delete: v1("CupServer/Delete"),
  },

  Server: {
    Info: v1("CupServer/Info"),
    InfoHome: v1("CupServer/InfoHome"),
    List: v1("CupServer/List"),
    Get: v1("CupServer/Get"),
    Create: v1("CupServer/Create"),
    Edit: v1("CupServer/Edit"),
    Delete: v1("CupServer/Delete"),
  },

  category: {
    cart: v1("Category/cart"),
    downloadAll: v1("Category/downloadAll"),
    download: v1("Category/download"),
    listPersonalIPNetworkDetails: v1("Category/ListPersonalIPNetworkDetails"),
    listPersonal: v1("Category/ListPersonal"),
    clone: v1("Category/Clone"),
    listCustom: v1("Category/ListCustome"),
    list: v1("Category/List"),
    create: v1("Category/Create"),
    edit: v1("Category/Edit"),
    deleteIPNetworkDetails: v1("Category/deleteIPNetworkDetails"),
    deleteIPNetworks: v1("Category/deleteIPNetworks"),
    deleteFull: v1("Category/Deletefull"),
  },

  Category: {
    Cart: v1("Category/cart"),
    DownloadAll: v1("Category/downloadAll"),
    Download: v1("Category/download"),
    ListPersonalIPNetworkDetails: v1("Category/ListPersonalIPNetworkDetails"),
    ListPersonal: v1("Category/ListPersonal"),
    Clone: v1("Category/Clone"),
    ListCustome: v1("Category/ListCustome"),
    List: v1("Category/List"),
    Create: v1("Category/Create"),
    Edit: v1("Category/Edit"),
    DeleteIPNetworkDetails: v1("Category/deleteIPNetworkDetails"),
    DeleteIPNetworks: v1("Category/deleteIPNetworks"),
    Deletefull: v1("Category/Deletefull"),
  },

  router: {
    get: v1("Router/Get"),
    list: v1("Router/List"),
    create: v1("Router/Create"),
    update: v1("Router/update"),
    edit: v1("Router/Edit"),
    delete: v1("Router/Delete"),
  },

  Router: {
    Get: v1("Router/Get"),
    List: v1("Router/List"),
    Create: v1("Router/Create"),
    Update: v1("Router/update"),
    Edit: v1("Router/Edit"),
    Delete: v1("Router/Delete"),
  },

  locationRouter: {
    get: v1("locationRouter/Get"),
    list: v1("locationRouter/List"),
    create: v1("locationRouter/Create"),
    edit: v1("locationRouter/Edit"),
    delete: v1("locationRouter/Delete"),
  },

  LocationRouter: {
    Get: v1("locationRouter/Get"),
    List: v1("locationRouter/List"),
    Create: v1("locationRouter/Create"),
    Edit: v1("locationRouter/Edit"),
    Delete: v1("locationRouter/Delete"),
  },

  zoneNetwork: {
    get: v1("ZoneNetwork/Get"),
    list: v1("ZoneNetwork/List"),
    create: v1("ZoneNetwork/Create"),
    edit: v1("ZoneNetwork/Edit"),
    service: v1("ZoneNetwork/Service"),
    delete: v1("ZoneNetwork/Delete"),
  },

  ZoneNetwork: {
    Get: v1("ZoneNetwork/Get"),
    List: v1("ZoneNetwork/List"),
    Create: v1("ZoneNetwork/Create"),
    Edit: v1("ZoneNetwork/Edit"),
    Service: v1("ZoneNetwork/Service"),
    Delete: v1("ZoneNetwork/Delete"),
  },

  personal: {
    list: v1("Personal/List"),
    get: v1("Personal/Get"),
    create: v1("Personal/Create"),
    edit: v1("Personal/Edit"),
    delete: v1("Personal/Delete"),
  },

  Personal: {
    List: v1("Personal/List"),
    Get: v1("Personal/Get"),
    Create: v1("Personal/Create"),
    Edit: v1("Personal/Edit"),
    Delete: v1("Personal/Delete"),
  },

  properties: {
    get: v1("Properties/Get"),
    list: v1("Properties/List"),
    create: v1("Properties/Create"),
    edit: v1("Properties/Edit"),
    delete: v1("Properties/Delete"),
  },

  Properties: {
    Get: v1("Properties/Get"),
    List: v1("Properties/List"),
    Create: v1("Properties/Create"),
    Edit: v1("Properties/Edit"),
    Delete: v1("Properties/Delete"),
  },

  reportName: {
    list: v1("ReportName/List"),
    get: v1("ReportName/Get"),
    create: v1("ReportName/Create"),
    edit: v1("ReportName/Edit"),
    delete: v1("ReportName/Delete"),
  },

  ReportName: {
    List: v1("ReportName/List"),
    Get: v1("ReportName/Get"),
    Create: v1("ReportName/Create"),
    Edit: v1("ReportName/Edit"),
    Delete: v1("ReportName/Delete"),
  },
};

export const endpoints = API_ENDPOINTS;

export default API_ENDPOINTS;