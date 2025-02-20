import { ReactNode } from "react";
import { IGlobalComponentProps } from "./global.interface";
import { IRiderProfile } from "./user.interface";
import { ORDER_TYPE } from "../types";

export interface IOrderComponentProps extends IGlobalComponentProps {
  order: IOrder;
  tab: ORDER_TYPE;
}

export interface IOrder {
  _id: string;
  orderId: string;
  paymentMethod?: string;
  items: Array<{
    variation: {
      price: number;
    };
    addons?: Array<{
      options: Array<{
        price: number;
        title: string;
      }>;
    }>;
    description: ReactNode;
    title: string;
    quantity: number;
  }>;
  user: {
    _id: string;
    name: string;
    phone: string;
  };
  restaurant : {
    name: string;
    logo:string
  }
  paymentStatus: string;
  createdAt: string;
  acceptedAt: string;
  deliveryAddress: {
    deliveryCharges: ReactNode;
    deliveryAddress: string;
  };
  orderAmount: number;
  orderStatus: string;
  preparationTime: string;
  completionTime: string;
  isPickedUp: boolean;
  isRiderRinged: boolean;
  rider: IRiderProfile;
}
