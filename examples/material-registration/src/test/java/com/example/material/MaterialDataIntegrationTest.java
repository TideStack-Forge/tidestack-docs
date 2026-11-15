package com.example.material;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

import com.example.material.model.Material;
import com.ouroboros.data.model.BaseTypedDataModel;
import com.ouroboros.data.model.MigrationStrategy;
import com.ouroboros.data.model.TypedDataModel;
import com.ouroboros.data.station.SqlDataStation;
import com.ouroboros.data.typed.runtime.TypedModelMetaHelper;
import com.ouroboros.exception.BusinessException;

class MaterialDataIntegrationTest {
  private AnnotationConfigApplicationContext context;
  private MaterialService service;
  private TypedDataModel<String, Material> materials;
  private TransactionTemplate transaction;

  @BeforeEach
  void setUp() {
    var dataSource = new JdbcDataSource();
    dataSource.setURL("jdbc:h2:mem:material_" + UUID.randomUUID()
        + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
    dataSource.setUser("sa");
    var meta = TypedModelMetaHelper.scanModelMate("com.example.material.model").get("sample.Material");
    assertNotNull(meta);
    var station = new SqlDataStation("default", dataSource, List.of(meta), MigrationStrategy.AUTO, "H2");
    var migration = station.migrate();
    assertTrue(migration.isRight(), () -> migration.getLeft().getMessage());
    materials = new BaseTypedDataModel<>(station.getDataModel("sample.Material").orElseThrow(), Material.class);
    var manager = new DataSourceTransactionManager(dataSource);
    transaction = new TransactionTemplate(manager);
    context = new AnnotationConfigApplicationContext();
    context.registerBean(PlatformTransactionManager.class, () -> manager);
    context.registerBean(MaterialService.class, () -> new MaterialService(materials));
    context.register(Transactions.class);
    context.refresh();
    service = context.getBean(MaterialService.class);
  }

  @AfterEach
  void close() { if (context != null) { context.close(); } }

  @Test
  void persistsAndQueriesThroughTheActualModel() {
    var created = service.create("MAT-001", "示例物料");
    assertEquals("示例物料", materials.get(created.getId()).get().getName());
    assertEquals(List.of("MAT-001"), service.list().stream().map(Material::getCode).toList());
  }

  @Test
  void rollsBackEarlierWriteWhenLaterWorkFails() {
    assertThrows(BusinessException.class, () -> transaction.executeWithoutResult(status -> {
      service.create("MAT-001", "第一条物料");
      service.create("MAT-002", " ");
    }));
    assertEquals(0L, materials.count(Map.of()).get());
  }

  @Test
  void propagatesFailedTryAndRollsBackTheTransaction() {
    assertThrows(RuntimeException.class, () -> transaction.executeWithoutResult(status -> {
      var created = service.create("MAT-001", "第一条物料");
      materials.insert(created).get();
    }));
    assertEquals(0L, materials.count(Map.of()).get());
  }

  @Configuration
  @EnableTransactionManagement
  static class Transactions { }
}
