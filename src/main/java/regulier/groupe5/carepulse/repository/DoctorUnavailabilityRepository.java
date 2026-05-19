package regulier.groupe5.carepulse.repository;

import regulier.groupe5.carepulse.entity.DoctorUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorUnavailabilityRepository extends JpaRepository<DoctorUnavailability, Long> {

  List<DoctorUnavailability> findByDoctor_Id(Long doctorId);

  @Query("SELECT u FROM DoctorUnavailability u WHERE u.doctor.id = :doctorId " +
      "AND u.startTime < :endTime AND u.endTime > :startTime")
  List<DoctorUnavailability> findOverlapping(
      @Param("doctorId") Long doctorId,
      @Param("startTime") LocalDateTime startTime,
      @Param("endTime") LocalDateTime endTime
  );

  @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
      "FROM DoctorUnavailability u WHERE u.doctor.id = :doctorId " +
      "AND u.startTime <= :dateTime AND u.endTime > :dateTime")
  boolean isUnavailable(
      @Param("doctorId") Long doctorId,
      @Param("dateTime") LocalDateTime dateTime
  );

  //List<DoctorUnavailability> findByDoctorIdAndEndTimeAfter(Long doctorId, LocalDateTime now);

  List<DoctorUnavailability> findByDoctor_IdAndEndTimeAfter(Long doctorId, LocalDateTime now);
}