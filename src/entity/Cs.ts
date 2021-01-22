import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("cs")
export default class Cs {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "title", type: "nvarchar", length: 100 })
  title: string;

  @Column({ name: "category", type: "nvarchar" })
  category: string;

  @Column({ name: "publish", type: "boolean", default: false })
  publish: boolean;

  @Column({ name: "content", type: "nvarchar", length: 5000 })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
