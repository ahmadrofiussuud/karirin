export const interests = ["Desain", "Teknologi", "Menulis", "Bisnis", "Sosial"] as const;
export type Profile = {
  name: string; university: string; goal: string; interests: string[];
  experience: string; hours: number; committed: number; budget: number; student: boolean;
};
export type Opportunity = {
  id: string; title: string; organizer: string; category: string; type: string;
  date: string; weeks: number; hours: number; cost: number; level: string;
  description: string; deliverable: string; studentOnly: boolean; color: string; mark: string;
};
export const opportunities: Opportunity[] = [
  {id:"design",title:"Rancang ruang belajar yang lebih baik.",organizer:"Studio Kampus",category:"Desain",type:"Design challenge",date:"2026-11-15",weeks:3,hours:18,cost:0,level:"Pemula",description:"Eksplorasi satu masalah belajar mahasiswa, lalu terjemahkan menjadi pengalaman digital yang sederhana dan inklusif.",deliverable:"Satu studi kasus, user flow, dan 3 layar prototipe",studentOnly:true,color:"peach",mark:"D"},
  {id:"essay",title:"Ide kecil untuk perubahan besar.",organizer:"Forum Gagasan Muda",category:"Menulis",type:"Kompetisi esai",date:"2026-11-20",weeks:4,hours:20,cost:25000,level:"Pemula",description:"Susun gagasan berbasis riset untuk menjawab persoalan di lingkungan sekitarmu. Fokus pada masalah yang benar-benar kamu pahami.",deliverable:"Esai 1.500–2.000 kata dan daftar pustaka",studentOnly:true,color:"sage",mark:"E"},
  {id:"code",title:"Bangun alat yang berguna sehari-hari.",organizer:"Komunitas Build Together",category:"Teknologi",type:"Mini hackathon",date:"2026-11-28",weeks:3,hours:27,cost:50000,level:"Menengah",description:"Buat prototipe web untuk menyederhanakan satu kegiatan sehari-hari. Kamu dapat bekerja sendiri atau bersama teman.",deliverable:"Demo aplikasi, repositori, dan presentasi 3 menit",studentOnly:false,color:"blue",mark:"H"},
  {id:"social",title:"Dengarkan, petakan, lalu bertindak.",organizer:"Ruang Bertumbuh",category:"Sosial",type:"Proyek komunitas",date:"2026-12-05",weeks:4,hours:16,cost:0,level:"Pemula",description:"Belajar memetakan kebutuhan komunitas melalui observasi dan percakapan, kemudian merancang satu intervensi kecil.",deliverable:"Peta masalah dan laporan aksi komunitas",studentOnly:false,color:"yellow",mark:"S"},
  {id:"business",title:"Uji ide usahamu sebelum melangkah.",organizer:"Inkubator Mahasiswa",category:"Bisnis",type:"Business sprint",date:"2026-12-12",weeks:4,hours:24,cost:75000,level:"Pemula",description:"Ubah asumsi tentang ide bisnis menjadi pertanyaan yang bisa diuji. Temui calon pengguna dan buat eksperimen pertamamu.",deliverable:"Lean canvas dan ringkasan 5 wawancara",studentOnly:true,color:"peach",mark:"B"},
];
export const emptyProfile: Profile = {name:"",university:"",goal:"Menemukan pengalaman pertama",interests:[],experience:"",hours:10,committed:4,budget:100000,student:true};
export const barriers = ["Bingung mulai dari mana", "Belum punya pengalaman", "Takut hasilnya kurang baik", "Waktu terasa sempit"] as const;
export type Task = {id:string; title:string; detail:string; done:boolean};
export type Journey = {opportunityId:string; barrier:string; tasks:Task[]; status:"Direncanakan"|"Didaftar"|"Diikuti"|"Direfleksikan"; reflection:string; actualHours:string; createdAt:string; ifThen:string};
export type State = {version:1; profile:Profile; profileSaved:boolean; saved:string[]; journeys:Journey[]};
export const initialState: State = {version:1,profile:emptyProfile,profileSaved:false,saved:[],journeys:[]};
export const STORAGE_KEY = "arah.workspace.v1";
export function reality(profile:Profile, opportunity:Opportunity, weeks=opportunity.weeks) {
  const available = Math.max(0, profile.hours-profile.committed);
  const required = Math.round(opportunity.hours/Math.max(1,weeks)*10)/10;
  return {available,required,overload:Math.round(Math.max(0,required-available)*10)/10,remaining:Math.round((available-required)*10)/10,affordable:opportunity.cost<=profile.budget,eligible:!opportunity.studentOnly||profile.student};
}
export function rankOpportunities(profile:Profile) {
  return [...opportunities].sort((a,b)=>Number(profile.interests.includes(b.category))-Number(profile.interests.includes(a.category))||Number(reality(profile,b).eligible)-Number(reality(profile,a).eligible));
}
export function makeTasks(opportunity:Opportunity, barrier:string): Task[] {
  const support:Record<string,[string,string]> = {
    "Bingung mulai dari mana":["Pecah tugas pertamamu","Tulis tiga hal yang perlu dikerjakan. Pilih satu yang bisa selesai dalam 30 menit."],
    "Belum punya pengalaman":["Temukan modal awalmu","Catat satu tugas kuliah atau pengalaman yang relevan. Pelajari satu contoh karya pemula."],
    "Takut hasilnya kurang baik":["Buat versi pertama yang sederhana","Kerjakan draf selama 30 menit tanpa menyunting. Minta satu teman memberi umpan balik."],
    "Waktu terasa sempit":["Sisihkan satu blok waktu","Pilih slot 30 menit yang realistis. Kurangi cakupan tugas, bukan waktu istirahat."],
  };
  const chosen=support[barrier]||support[barriers[0]];
  return [
    {id:"brief",title:"Pahami tantangannya",detail:`Baca kebutuhan ${opportunity.type.toLowerCase()}. Catat luaran: ${opportunity.deliverable.toLowerCase()}.`,done:false},
    {id:"start",title:chosen[0],detail:chosen[1],done:false},
    {id:"draft",title:"Wujudkan satu draf awal",detail:`Siapkan versi awal ${opportunity.deliverable.toLowerCase()} dan minta masukan dari teman atau mentor.`,done:false},
    {id:"review",title:"Tinjau dan siapkan pendaftaran",detail:"Periksa persyaratan, perbaiki draf, dan tentukan waktu untuk mendaftar. Latihan ini tidak wajib selesai sebelum mendaftar.",done:false},
  ];
}
export function parseState(raw:string|null):State|null {
  if(!raw) return null;
  try {
    const value=JSON.parse(raw) as State;
    const p=value.profile;
    if(value.version!==1||!p||typeof value.profileSaved!=="boolean"||typeof p.name!=="string"||typeof p.university!=="string"||typeof p.goal!=="string"||typeof p.experience!=="string"||typeof p.student!=="boolean"||!Array.isArray(p.interests)||!p.interests.every(x=>interests.includes(x as typeof interests[number]))||![p.hours,p.committed,p.budget].every(x=>typeof x==="number"&&Number.isFinite(x)&&x>=0)||p.hours>168||p.committed>p.hours||!Array.isArray(value.saved)||!value.saved.every(x=>opportunities.some(o=>o.id===x))||!Array.isArray(value.journeys)) return null;
    if(!value.journeys.every(j=>opportunities.some(o=>o.id===j.opportunityId)&&typeof j.barrier==="string"&&typeof j.reflection==="string"&&typeof j.actualHours==="string"&&typeof j.ifThen==="string"&&typeof j.createdAt==="string"&&["Direncanakan","Didaftar","Diikuti","Direfleksikan"].includes(j.status)&&Array.isArray(j.tasks)&&j.tasks.every(t=>typeof t.id==="string"&&typeof t.title==="string"&&typeof t.detail==="string"&&typeof t.done==="boolean")))return null;
    return value;
  } catch {return null;}
}
export function money(amount:number){return amount===0?"Gratis":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(amount);}
