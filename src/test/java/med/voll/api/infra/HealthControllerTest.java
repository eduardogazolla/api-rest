package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HealthControllerTest {

    @Test
    @DisplayName("Deve responder ok no health check")
    void deveResponderOk() {
        assertEquals("ok", new HealthController().health());
    }
}
