package com.example.material;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import com.ouroboros.data.annotation.DataModelScan;

@Configuration
@DataModelScan("com.example.material.model")
@Import({MaterialService.class, MaterialController.class})
public class MaterialAutoConfiguration { }
