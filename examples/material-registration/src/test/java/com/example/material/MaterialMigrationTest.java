package com.example.material;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.Test;

import com.ouroboros.data.model.DataModelFieldMeta;
import com.ouroboros.data.model.MigrationStrategy;
import com.ouroboros.data.station.SqlDataStation;
import com.ouroboros.data.typed.runtime.TypedModelMetaHelper;

class MaterialMigrationTest {
  @Test
  void addsOptionalFieldAndPreservesExistingDataWithoutBackfilling() {
    var dataSource = new JdbcDataSource();
    dataSource.setURL("jdbc:h2:mem:migration_" + UUID.randomUUID()
        + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
    dataSource.setUser("sa");
    var v1 = TypedModelMetaHelper.scanModelMate("com.example.material.model").get("sample.Material");
    var oldStation = new SqlDataStation("default", dataSource, List.of(v1), MigrationStrategy.AUTO, "H2");
    var first = oldStation.migrate();
    assertTrue(first.isRight(), () -> first.getLeft().getMessage());
    oldStation.getDataModel("sample.Material").orElseThrow().insert(Map.of(
        "id", "legacy-1", "code", "MAT-001", "name", "原有物料")).get();

    var v2 = v1.deepCopy();
    var category = new DataModelFieldMeta();
    category.setName("category");
    category.setRawName("category");
    category.setType("String");
    category.setSize(64);
    category.setIsNullable(true);
    var fields = new ArrayList<>(v2.getFields());
    fields.add(category);
    v2.setFields(fields);
    var newStation = new SqlDataStation("default", dataSource, List.of(v2), MigrationStrategy.AUTO, "H2");
    var sql = newStation.generateMigrationSql(newStation.getDataModelList());
    assertTrue(sql.isRight(), () -> sql.getLeft().getMessage());
    assertFalse(sql.get().isEmpty());
    var second = newStation.migrate();
    assertTrue(second.isRight(), () -> second.getLeft().getMessage());

    var model = newStation.getDataModel("sample.Material").orElseThrow();
    var existing = model.get("legacy-1").get();
    assertEquals("原有物料", existing.get("name"));
    assertNull(existing.get("category"));
    var where = new HashMap<String, Object>();
    where.put("id", "legacy-1");
    where.put("category", null);
    assertEquals(1L, model.update(where, Map.of("category", "GENERAL")).get());
    assertEquals(0L, model.update(where, Map.of("category", "OTHER")).get());
    assertEquals("GENERAL", model.get("legacy-1").get().get("category"));
    assertEquals(1L, model.count(Map.of()).get());
  }
}
