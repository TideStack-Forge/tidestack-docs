package com.example.material;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.material.model.Material;
import com.ouroboros.security.annotation.Authority;
import com.ouroboros.web.ItemsWebApiResult;
import com.ouroboros.web.WebApiResult;

@RestController
@RequestMapping("/api/custom/materials")
public class MaterialController {
  private final MaterialService service;

  public MaterialController(MaterialService service) { this.service = service; }

  @Authority("sample.Material.read")
  @GetMapping
  public ItemsWebApiResult<Material> list() {
    return ItemsWebApiResult.ok(service.list());
  }

  @Authority("sample.Material.create")
  @PostMapping
  public WebApiResult<Material> create(@RequestBody CreateMaterial input) {
    return WebApiResult.ok(service.create(input.code(), input.name()));
  }

  public record CreateMaterial(String code, String name) { }
}
