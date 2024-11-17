function invalidLength(field, value, constraints) {
  const { min, max } = constraints
  const minExists = min !== undefined
  const maxExists = max !== undefined
  const cappedField = field[0].toUpperCase() + field.slice(1)
  const trunk = `${cappedField} length (${value.length}) must be`

  if (minExists && maxExists) {
    return `${trunk} ${min} to ${max} characters.`
  } else if (maxExists) {
    return `${trunk} less than ${max} characters.`
  } else if (minExists) {
    return `${trunk} at least ${min} characters.`
  } else {
    throw new Error(
      `Neither max nor min length is defined for field '${field}'.`,
    )
  }
}

module.exports = {
  invalidLength,
}
