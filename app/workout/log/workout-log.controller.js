import asyncHandler from 'express-async-handler'

import { prisma } from '../../prisma.js'

// @desc    Create new workout log
// @route   POST /api/workouts/log/:id
// @access  Private

export const createNewWorkoutLog = asyncHandler(async (req, res) => {
  // Извлекаем идентификатор тренировки из параметров запроса и преобразуем его в число.
  const workoutId = +req.params.id

  // Ищем тренировку в базе данных по её ID.
  // Используем метод findUnique для поиска конкретной тренировки.
  // Включаем связанные с тренировкой упражнения в результат поиска.
  const workout = await prisma.workout.findUnique({
    where: {
      id: workoutId // Поиск по полю id, равному значению workoutId.
    },
    include: {
      exercises: true // Включаем связанные упражнения, чтобы они были частью результата.
    }
  })

  // Если тренировка не найдена, отправляем ответ с кодом 404 (Not Found) и выбрасываем ошибку.
  if (!workout) {
    res.status(404)
    throw new Error('Workout not found!')
  }

  // Создаем новый лог тренировки в базе данных с использованием метода create.
  const workoutLog = await prisma.workoutLog.create({
    data: {
      // Связываем лог тренировки с пользователем, который инициировал запрос, используя его ID.
      user: {
        connect: {
          id: req.user.id // Устанавливаем связь с пользователем через его ID.
        }
      },
      // Связываем лог тренировки с найденной тренировкой через её ID.
      workout: {
        connect: {
          id: workoutId // Устанавливаем связь с тренировкой через её ID.
        }
      },
      // Создаем логи для каждого упражнения, связанного с тренировкой.
      exerciseLogs: {
        create: workout.exercises.map(exercise => ({
          // Связываем лог упражнения с пользователем.
          user: {
            connect: {
              id: req.user.id // Устанавливаем связь с пользователем через его ID.
            }
          },
          // Связываем лог с конкретным упражнением через его ID.
          exercise: {
            connect: {
              id: exercise.id // Устанавливаем связь с упражнением через его ID.
            }
          },
          // Создаем записи времени выполнения упражнения.
          times: {
            // Для каждого повторения упражнения создаем запись с начальными значениями (0 вес, 0 повторений).
            create: Array.from({ length: exercise.times }, () => ({
              weight: 0, // Изначальный вес 0.
              repeat: 0 // Изначальное количество повторений 0.
            }))
          }
        }))
      }
    },
    // Включаем созданные exerciseLogs (логи упражнений) и их связанные times (время выполнения) в результат.
    include: {
      exerciseLogs: {
        include: {
          times: true // Включаем информацию о времени выполнения для каждого лога упражнения.
        }
      }
    }
  })

  // Отправляем обратно на клиент созданный лог тренировки в формате JSON.
  res.json(workoutLog)
})
