const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  COLLABORATOR: "Collaborator",
  USER: "User",
};

const ADMIN_AND_TEAM = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
  ROLES.COLLABORATOR,
];
const ALL_ROLES = [...ADMIN_AND_TEAM, ROLES.USER];

module.exports = { ROLES, ADMIN_AND_TEAM, ALL_ROLES };
