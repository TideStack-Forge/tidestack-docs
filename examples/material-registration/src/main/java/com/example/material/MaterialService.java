package com.example.material;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.material.model.Material;
import com.ouroboros.data.model.TypedDataModel;
import com.ouroboros.exception.BusinessException;

@Service
public class MaterialService {
  private final TypedDataModel<String, Material> materials;

  public MaterialService(TypedDataModel<String, Material> materials) {
    this.materials = materials;
  }

  @Transactional(rollbackFor = Exception.class)
  public Material create(String code, String name) {
    var material = new Material();
    material.setId(UUID.randomUUID().toString());
    material.setCode(required(code, "编码", 64));
    material.setName(required(name, "名称", 200));
    return materials.insert(material).get();
  }

  public List<Material> list() {
    return materials.query(Map.of("orderBy", "code", "limit", 100)).get();
  }

  private static String required(String value, String label, int maxLength) {
    if (value == null || value.isBlank()) {
      throw new BusinessException(label + "不能为空");
    }
    String normalized = value.strip();
    if (normalized.length() > maxLength) {
      throw new BusinessException(label + "不能超过 " + maxLength + " 个字符");
    }
    return normalized;
  }
}
