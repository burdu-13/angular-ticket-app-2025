export interface Event {
    _id: string;
    name: string;
    date: Date;
    category: string;
    description: string;
    imgUrl: string;
    ticketTiers: TicketTier[];
    companyName: string;
    isSalesSuspended: boolean;
  }
  
  export interface TicketTier {
    _id: string;
    name: string;
    ticketsAvailable: number;
    price: number;
    ticketsSold: number;
  }
  