package com.example.material.model;

import com.ouroboros.data.annotation.Field;
import com.ouroboros.data.annotation.Model;
import com.ouroboros.data.annotation.PrimaryKey;

@Model(fullName = "sample.Material", rawName = "sample_material", label = "物料")
public class Material {
  @Field(size = 64)
  @PrimaryKey
  private String id;

  @Field(label = "编码", size = 64)
  private String code;

  @Field(label = "名称", size = 200)
  private String name;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
}
