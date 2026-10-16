Feature: Registro de usuario en Chrome Android

  @smoke @register @mobile
  Scenario: Registro exitoso con datos únicos desde Chrome Android
    Given el usuario navega al sitio de Automation Exercise
    When se registra un nuevo usuario con datos únicos
    Then la UI muestra la confirmación de cuenta creada