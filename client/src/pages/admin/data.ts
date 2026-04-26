export const PATIENTS = [
  { id:'P001', name:'Rakoto Andry', age:42, phone:'+261 32 11 22 33', district:'Toamasina I', status:'actif', lastVisit:'12 avr 2026', condition:'Myopie', score:85 },
  { id:'P002', name:'Rasoamahandry Hanta', age:28, phone:'+261 33 44 55 66', district:'Toamasina II', status:'actif', lastVisit:'10 avr 2026', condition:'Astigmatisme', score:92 },
  { id:'P003', name:'Rabemananjara Solo', age:55, phone:'+261 34 77 88 99', district:'Brickaville', status:'en_attente', lastVisit:'5 avr 2026', condition:'Glaucome', score:67 },
  { id:'P004', name:'Randriamahefa Liva', age:35, phone:'+261 32 22 33 44', district:'Mahanoro', status:'actif', lastVisit:'1 avr 2026', condition:'Hypermétropie', score:78 },
  { id:'P005', name:'Rajaonarison Voavy', age:19, phone:'+261 33 55 66 77', district:'Toamasina I', status:'inactif', lastVisit:'15 mars 2026', condition:'Myopie', score:90 },
  { id:'P006', name:'Raharinivo Mamy', age:61, phone:'+261 34 88 99 00', district:'Vatomandry', status:'actif', lastVisit:'8 avr 2026', condition:'Cataracte', score:55 },
];

export const APPOINTMENTS = [
  { id:'R001', patient:'Rakoto Andry', type:'Consultation', date:'2026-04-26', time:'09:00', doctor:'Dr. Marie Rakoto', status:'confirme', district:'Toamasina I' },
  { id:'R002', patient:'Rasoamahandry Hanta', type:'Suivi', date:'2026-04-26', time:'10:30', doctor:'Dr. Jean Rakotondrazaka', status:'confirme', district:'Toamasina II' },
  { id:'R003', patient:'Rabemananjara Solo', type:'Téléexpertise', date:'2026-04-27', time:'14:00', doctor:'Dr. Marie Rakoto', status:'en_attente', district:'Brickaville' },
  { id:'R004', patient:'Randriamahefa Liva', type:'Examen visuel', date:'2026-04-28', time:'09:30', doctor:'Dr. Jean Rakotondrazaka', status:'confirme', district:'Mahanoro' },
  { id:'R005', patient:'Rajaonarison Voavy', type:'Consultation', date:'2026-04-29', time:'11:00', doctor:'Dr. Marie Rakoto', status:'annule', district:'Toamasina I' },
];

export const ORDERS = [
  { id:'#CMD-001', client:'Rakoto Andry', items:'Lunettes de vue x1', amount:'150 000 Ar', date:'24 avr', status:'expedie', payment:'Orange Money' },
  { id:'#CMD-002', client:'Rasoamahandry Hanta', items:'Lentilles x2, Solution x1', amount:'195 000 Ar', date:'23 avr', status:'en_preparation', payment:'Mvola' },
  { id:'#CMD-003', client:'Randriamahefa Liva', items:'Lunettes de vue x1', amount:'200 000 Ar', date:'22 avr', status:'livre', payment:'Airtel Money' },
  { id:'#CMD-004', client:'Raharinivo Mamy', items:'Étui x1, Chiffon x2', amount:'35 000 Ar', date:'21 avr', status:'en_attente', payment:'Espèces' },
];

export const INVENTORY = [
  { id:'INV001', name:'Lunettes de vue classiques', category:'Lunettes', stock:48, min:10, price:'150 000 Ar', status:'ok' },
  { id:'INV002', name:'Lunettes de soleil UV', category:'Lunettes', stock:22, min:10, price:'200 000 Ar', status:'ok' },
  { id:'INV003', name:'Lentilles mensuelles', category:'Lentilles', stock:8, min:15, price:'80 000 Ar', status:'low' },
  { id:'INV004', name:'Solution nettoyante', category:'Solutions', stock:3, min:10, price:'35 000 Ar', status:'critical' },
  { id:'INV005', name:'Étui de rangement', category:'Accessoires', stock:60, min:10, price:'25 000 Ar', status:'ok' },
  { id:'INV006', name:'Chiffon microfibre', category:'Accessoires', stock:120, min:20, price:'5 000 Ar', status:'ok' },
];

export const USERS_LIST = [
  { id:'U001', name:'Dr. Marie Rakoto', role:'ophtalmologue', email:'docteur@vanclinic.mg', status:'actif', lastLogin:"Aujourd'hui 08:30" },
  { id:'U002', name:'Dr. Jean Rakotondrazaka', role:'ophtalmologue', email:'j.rakotondrazaka@vanclinic.mg', status:'actif', lastLogin:'Hier 14:00' },
  { id:'U003', name:'Rabe Coordinateur', role:'coordinateur', email:'coordinateur@vanclinic.mg', status:'actif', lastLogin:"Aujourd'hui 07:00" },
  { id:'U004', name:'Hery Technicien', role:'technicien', email:'technicien@vanclinic.mg', status:'actif', lastLogin:"Aujourd'hui 09:15" },
  { id:'U005', name:'Vola Agent', role:'agent', email:'agent@vanclinic.mg', status:'inactif', lastLogin:'Il y a 5 jours' },
  { id:'U006', name:'Jean Dupont', role:'patient', email:'patient@vanclinic.mg', status:'actif', lastLogin:'Hier 16:00' },
];

export type PatientStatus = 'actif' | 'inactif' | 'en_attente';
export type OrderStatus = 'expedie' | 'en_preparation' | 'livre' | 'en_attente';
export type StockStatus = 'ok' | 'low' | 'critical';
export type AppointmentStatus = 'confirme' | 'en_attente' | 'annule';
