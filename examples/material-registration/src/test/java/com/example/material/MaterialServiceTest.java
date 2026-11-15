package com.example.material;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import io.vavr.control.Try;

import com.example.material.model.Material;
import com.ouroboros.data.model.TypedDataModel;
import com.ouroboros.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {
  @Mock
  private TypedDataModel<String, Material> materials;
  private MaterialService service;

  @BeforeEach
  void setUp() { service = new MaterialService(materials); }

  @Test
  void createsNormalizedMaterial() {
    when(materials.insert(any(Material.class))).thenAnswer(invocation ->
        Try.success(invocation.getArgument(0, Material.class)));
    var created = service.create(" MAT-001 ", " 示例物料 ");
    assertEquals("MAT-001", created.getCode());
    assertEquals("示例物料", created.getName());
    assertNotNull(created.getId());
    verify(materials).insert(created);
  }

  @Test
  void rejectsBlankCodeBeforeWriting() {
    var failure = assertThrows(BusinessException.class, () -> service.create(" ", "物料"));
    assertEquals("编码不能为空", failure.getMessage());
    verifyNoInteractions(materials);
  }

  @Test
  void rejectsNameBeyondStorageLength() {
    assertThrows(BusinessException.class, () -> service.create("MAT-001", "料".repeat(201)));
    verifyNoInteractions(materials);
  }

  @Test
  void propagatesStorageFailure() {
    var failure = new IllegalStateException("测试用存储失败");
    when(materials.insert(any(Material.class))).thenReturn(Try.failure(failure));
    assertSame(failure, assertThrows(IllegalStateException.class,
        () -> service.create("MAT-001", "物料")));
  }
}
