package regulier.groupe5.carepulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CarepulseApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarepulseApplication.class, args);
	}

}
