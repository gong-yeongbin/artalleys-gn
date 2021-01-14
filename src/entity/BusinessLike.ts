import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User, Business } from "./Entity";

@Entity("business_like")
export default class BusinessLike {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;

  @ManyToOne(() => Business, (business) => business.businessLike)
  @JoinColumn({ name: "Business" })
  business: Business;
}
