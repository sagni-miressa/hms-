export const dashboardData = {
  kpiStats: [
    { id: 1, title: "Total Users", value: 2543, icon: "group", change: "+12%", changeColor: "green" },
    { id: 2, title: "Active Job Postings", value: 142, icon: "work", change: "+5%", changeColor: "green" },
    { id: 3, title: "System Uptime", value: "99.9%", icon: "dns", change: "0%", changeColor: "gray" },
    { id: 4, title: "Recent Alerts", value: 5, icon: "warning", change: "+2%", changeColor: "red" },
  ],

  chart: {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    data: [40, 55, 35, 70, 60, 80, 45, 30, 65, 50, 75, 85],
  },

  systemStatus: [
    { id: 1, name: "Database Cluster", status: "Operational", color: "green" },
    { id: 2, name: "Auth Service", status: "Operational", color: "green" },
    { id: 3, name: "Email Gateway", status: "Degraded", color: "yellow" },
    { id: 4, name: "Storage API", status: "Operational", color: "green" },
  ],

  quickActions: [
    { id: 1, title: "New User", icon: "person_add" },
    { id: 2, title: "Reset Pass", icon: "lock_reset" },
    { id: 3, title: "Broadcast", icon: "campaign" },
    { id: 4, title: "Backups", icon: "settings_backup_restore" },
  ],

  users: [
    {
      id: 1,
      name: "Sarah Jensen",
      email: "sarah.j@company.com",
      role: "Recruiter",
      roleIcon: "badge",
      status: "Active",
      lastLogin: "2 mins ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXQhtE86rZZiEMF7Y8rRn4ikVK5eWbkw9SKrJAv_XLKS0YBF5qpepiOtp-I36Te2uTV10CyjXYjdflk5sU1xkCUP28JDaeUeGvbRSRzNp7vm_JgFfhuOHtc-EAfPkMLbiNivepiZLYTEjCV4WxrBGguQtsZSmOZkzcBpM7p-hbd5bt7FzCuHXwrhW97r7iLUVmEYXl89F0xVNxnh74AfCH0YpCLu1H8U3n8Bq2YfSUABozZ07_e6aun_Zj-Kvs18Z9Ep6NdkBNWA",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@company.com",
      role: "Manager",
      roleIcon: "admin_panel_settings",
      status: "Away",
      lastLogin: "4 hours ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrHBWtoAzkswRTj5yyeQTP2-fj9wiik4ayz77ypo5r6ApfbCqAHvkEGas481K6BmIWyZgl3ta1KOyvUNpzkpp9-9Af9NjYZO5ohJc9E_F7zEj8ObZKz4mmBrRaqxcR-gbdgB0_BqUThfovMy14kMQ4ciG5FSZSrMKJOtZ0pSru3KluOgDjsLEROSB856Cfq4Wsq0QTG-7Cp51emIbdB1yvIL6EzOILxFiliqL9OBiKA9qGXxmeiOOpsHM6vYEDXEjObt4BL1MqHw",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.d@company.com",
      role: "Candidate",
      roleIcon: "person",
      status: "Suspended",
      lastLogin: "2 days ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9dMfVJcmAc3eH1zg0k1N2PI9oyv70Py2Nf4DVCJuTwIsEGmxBVJUlb1T32PtU1m6UGbDpH-EbraRLvdHqaAEmY5pIsBhdmbGygS9Rf67dggcQpYpfPi6XMIQNZTJ_pZu873rvh6bq2mbQuzf2T27InerYiVOwIejSB1A9kR7B7_JuPBRVXNI0Cqy-pc6WXEGeX3LYqtoFWlrYrBeasJVf2BaO1B7DTvMqv3d1yHJ8fYjf5k9cXPGbdxHwdVIZUl289f8IebZaUA",
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.k@company.com",
      role: "Recruiter",
      roleIcon: "badge",
      status: "Active",
      lastLogin: "1 day ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXU1iCzhROsASehi68GedrHX2a8wfzDFgChZfjd1QeLqxy1YTYr7N5NksXj_BFD7NRSCUuy-kIZ1EWRkHSdULcf2Gml1GximU4kumniYGby1IHGI2ksTcTj_W499EGBwi-h_-W7C6DlWBq9Mf0HRM2QKR7KUPBSRSAJGKoF_2td5la5v4f9XY3ea1vjJwvKO6AVBKKyKbdGdZrKVnh7J5TSUhUmDryKJM6ixOAZTn0nigFiqRa66Ofay1hCucra1aaIjde7mdnPw",
    },
    {
      id: 5,
      name: "Jessica Lee",
      email: "jess.lee@company.com",
      role: "Candidate",
      roleIcon: "person",
      status: "Pending",
      lastLogin: "Never",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1IXnXASb3aH8SXQmrnyVTciZrTGjyVuEEIR0j2KqCwAh1CnHXUuAvCGv3p9Hya7HJg9caB_XjhtIMbhyM2OZYFHkxvbUwLt_C2-mRcksL0KyACH4G_0MNh7ilCp-c-aXyqUKxf8mU_kEVXkiMCjuJNhDkMEWUd_s2kav2eW1dIa5kK24TKtrAxUmoEdDtPvD7sfXoiTAjJqyCbfflF__J8LfCLS-wGYvJ_Xd-t2kzv8mQHoBU5DljVD0VHoTmRMr2jlOb5RDjnA",
    },
  ],
};
