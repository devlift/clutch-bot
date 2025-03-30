import { IMenuData } from "@/types/menu-data-type";

const menu_data:IMenuData[] = [
  {
    id:1,
    link:'/',
    title:'Home',

  },
  {
    id:2,
    link:'/jobs',
    title:'Jobs',

  },
  {
    id:4,
    link:'/blog',
    title:'Blog',
  },
  {
    id:5,
    link:'/contact',
    title:'Contact'
  },
  // {
  //   id:6,
  //   link:'/dashboard/employer-dashboard',
  //   title:'Dashboard',
  //   sub_menus:[
  //     {link:'/dashboard/candidate-dashboard',title:'Candidate Dashboard'},
  //     {link:'/dashboard/employ-dashboard',title:'Employer Dashboard'},
  //   ]
  // }
]

export default menu_data;