import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import LikeType from "./LikeType";

@Entity("like")
export default class Like {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @OneToOne(() => LikeType)
  @JoinColumn({ name: "type_id" })
  type_id: LikeType;
}
