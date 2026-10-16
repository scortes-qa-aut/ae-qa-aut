Feature: Registro de usuario

  @smoke @register
  Scenario: Registro exitoso con datos únicos
    Given el usuario navega al sitio de Automation Exercise
    When se registra un nuevo usuario con datos únicos
    Then la UI muestra la confirmación de cuenta creada